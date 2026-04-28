const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const superadminAuth = require('../middleware/superadminAuth');
const SuperAdmin = require('../models/SuperAdmin');
const Restaurant = require('../models/Restaurant');
const Staff = require('../models/Staff');
const Customer = require('../models/Customer');
const LoyaltyCard = require('../models/LoyaltyCard');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

const router = express.Router();

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await SuperAdmin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { superadminId: admin._id, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) { next(err); }
});

// Seed superadmin (call once on first deploy, then disable or protect)
router.post('/seed', async (req, res, next) => {
  try {
    const existing = await SuperAdmin.findOne();
    if (existing) return res.status(400).json({ error: 'Superadmin already exists' });
    const { name, email, password } = req.body;
    const admin = await SuperAdmin.create({ name, email, password });
    res.status(201).json({ id: admin._id, email: admin.email });
  } catch (err) { next(err); }
});

// ─── Platform Analytics ───────────────────────────────────────────────────────

router.get('/analytics', superadminAuth, async (req, res, next) => {
  try {
    const [
      totalRestaurants,
      totalCustomers,
      totalTransactions,
      activeSubscriptions,
      trialSubscriptions,
      suspendedSubscriptions,
      recentRestaurants,
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Customer.countDocuments(),
      Transaction.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'trial' }),
      Subscription.countDocuments({ status: 'suspended' }),
      Restaurant.find().sort({ createdAt: -1 }).limit(5),
    ]);

    // Monthly revenue from active subscriptions
    const activeSubs = await Subscription.find({ status: 'active' }).populate('plan_id', 'price_monthly');
    const mrr = activeSubs.reduce((s, sub) => s + (sub.plan_id?.price_monthly || 0), 0);

    // Signups in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newRestaurantsThisMonth = await Restaurant.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      totals: { restaurants: totalRestaurants, customers: totalCustomers, transactions: totalTransactions },
      subscriptions: { active: activeSubscriptions, trial: trialSubscriptions, suspended: suspendedSubscriptions },
      mrr,
      newRestaurantsThisMonth,
      recentRestaurants,
    });
  } catch (err) { next(err); }
});

// ─── Restaurants (Tenants) ────────────────────────────────────────────────────

router.get('/restaurants', superadminAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const restaurants = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const ids = restaurants.map((r) => r._id);
    const subs = await Subscription.find({ restaurant_id: { $in: ids } }).populate('plan_id');
    const subsMap = Object.fromEntries(subs.map((s) => [s.restaurant_id.toString(), s]));

    const customerCounts = await LoyaltyCard.aggregate([
      { $match: { restaurant_id: { $in: ids } } },
      { $group: { _id: '$restaurant_id', count: { $sum: 1 } } },
    ]);
    const ccMap = Object.fromEntries(customerCounts.map((c) => [c._id.toString(), c.count]));

    const data = restaurants.map((r) => ({
      ...r.toObject(),
      subscription: subsMap[r._id.toString()] || null,
      customerCount: ccMap[r._id.toString()] || 0,
    }));

    const total = await Restaurant.countDocuments(query);
    res.json({ restaurants: data, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get('/restaurants/:id', superadminAuth, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Not found' });

    const [subscription, staffList, customerCount, txCount] = await Promise.all([
      Subscription.findOne({ restaurant_id: restaurant._id }).populate('plan_id'),
      Staff.find({ restaurant_id: restaurant._id }),
      LoyaltyCard.countDocuments({ restaurant_id: restaurant._id }),
      Transaction.countDocuments({
        card_id: { $in: (await LoyaltyCard.find({ restaurant_id: restaurant._id }, '_id')).map((c) => c._id) },
      }),
    ]);

    res.json({ restaurant, subscription, staff: staffList, stats: { customerCount, txCount } });
  } catch (err) { next(err); }
});

router.post('/restaurants', superadminAuth, async (req, res, next) => {
  try {
    const { name, slug, brand_color, accent_color, points_per_100, reward_threshold, reward_description, planId } = req.body;

    const restaurant = await Restaurant.create({
      name, slug, brand_color, accent_color, points_per_100, reward_threshold, reward_description,
    });

    const plan = planId ? await Plan.findById(planId) : await Plan.findOne({ name: 'Starter' });
    if (plan) {
      await Subscription.create({ restaurant_id: restaurant._id, plan_id: plan._id, status: 'trial' });
    }

    res.status(201).json({ restaurant });
  } catch (err) { next(err); }
});

router.patch('/restaurants/:id', superadminAuth, async (req, res, next) => {
  try {
    const allowed = ['name', 'slug', 'logo_url', 'brand_color', 'accent_color', 'points_per_100', 'reward_threshold', 'reward_description'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ restaurant });
  } catch (err) { next(err); }
});

router.delete('/restaurants/:id', superadminAuth, async (req, res, next) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    await Subscription.deleteOne({ restaurant_id: req.params.id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── Subscription Management ──────────────────────────────────────────────────

router.patch('/restaurants/:id/subscription', superadminAuth, async (req, res, next) => {
  try {
    const { planId, status, notes } = req.body;
    const update = {};
    if (planId) update.plan_id = planId;
    if (status) update.status = status;
    if (notes) update.notes = notes;
    if (status === 'active') {
      update.current_period_start = new Date();
      update.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    const sub = await Subscription.findOneAndUpdate(
      { restaurant_id: req.params.id },
      update,
      { new: true, upsert: true }
    ).populate('plan_id');
    res.json({ subscription: sub });
  } catch (err) { next(err); }
});

// ─── Staff Management ─────────────────────────────────────────────────────────

router.post('/restaurants/:id/staff', superadminAuth, async (req, res, next) => {
  try {
    const { name, phone, role } = req.body;
    const staff = await Staff.create({ restaurant_id: req.params.id, name, phone, role });
    res.status(201).json({ staff });
  } catch (err) { next(err); }
});

router.delete('/staff/:staffId', superadminAuth, async (req, res, next) => {
  try {
    await Staff.findByIdAndDelete(req.params.staffId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── Plans ────────────────────────────────────────────────────────────────────

router.get('/plans', superadminAuth, async (req, res, next) => {
  try {
    const plans = await Plan.find({ is_active: true }).sort({ price_monthly: 1 });
    res.json({ plans });
  } catch (err) { next(err); }
});

router.post('/plans', superadminAuth, async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ plan });
  } catch (err) { next(err); }
});

router.patch('/plans/:id', superadminAuth, async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ plan });
  } catch (err) { next(err); }
});

// ─── Platform-wide Customer View ─────────────────────────────────────────────

router.get('/customers', superadminAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    let query = {};
    if (search) query = { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search } }] };
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ customers, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

module.exports = router;

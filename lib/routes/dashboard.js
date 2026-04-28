const express = require('express');
const { managerOnly, staffOnly } = require('../middleware/auth');
const restaurantScope = require('../middleware/restaurantScope');
const LoyaltyCard = require('../models/LoyaltyCard');
const Transaction = require('../models/Transaction');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// Public endpoint — look up restaurant by slug (for branded landing pages)
router.get('/restaurant-by-slug/:slug', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug }).select(
      'name slug logo_url brand_color accent_color points_per_100 reward_threshold reward_description'
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});

// Public endpoint — no auth (used by landing page to show restaurant info)
router.get('/restaurant-public/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select(
      'name slug logo_url brand_color accent_color points_per_100 reward_threshold reward_description'
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});

// Update restaurant settings
router.patch('/restaurant/:id', managerOnly, async (req, res, next) => {
  try {
    const allowed = ['name', 'logo_url', 'brand_color', 'accent_color', 'points_per_100', 'reward_threshold', 'reward_description'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});

router.get('/overview', managerOnly, restaurantScope, async (req, res, next) => {
  try {
    const restaurantId = req.restaurant._id;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const atRiskDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const cards = await LoyaltyCard.find({ restaurant_id: restaurantId });
    const cardIds = cards.map((c) => c._id);

    const [todayTxns, atRiskCount, recentTxns, newEnrollments] = await Promise.all([
      Transaction.find({ card_id: { $in: cardIds }, createdAt: { $gte: startOfDay } }),
      LoyaltyCard.countDocuments({ restaurant_id: restaurantId, last_visit: { $lt: atRiskDate } }),
      Transaction.find({ card_id: { $in: cardIds } })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate({ path: 'card_id', populate: { path: 'customer_id', select: 'name' } }),
      LoyaltyCard.countDocuments({ restaurant_id: restaurantId, enrolled_at: { $gte: startOfDay } }),
    ]);

    const topCustomers = await LoyaltyCard.find({ restaurant_id: restaurantId })
      .sort({ points_balance: -1 })
      .limit(5)
      .populate('customer_id', 'name phone');

    res.json({
      today: {
        scans: todayTxns.filter((t) => t.type === 'earn').length,
        newEnrollments,
        pointsIssued: todayTxns.reduce((s, t) => s + (t.points_delta > 0 ? t.points_delta : 0), 0),
        redemptions: todayTxns.filter((t) => t.type === 'redeem').length,
      },
      thisWeek: { scans: todayTxns.length, topCustomers },
      allTime: { totalCustomers: cards.length, totalVisits: cards.reduce((s, c) => s + c.total_visits, 0) },
      atRisk: atRiskCount,
      recentTransactions: recentTxns,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/customers', staffOnly, restaurantScope, async (req, res, next) => {
  try {
    const { segment = 'all', page = 1, limit = 20 } = req.query;
    const restaurantId = req.restaurant._id;
    const now = new Date();

    let query = { restaurant_id: restaurantId };
    if (segment === 'active') query.last_visit = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    else if (segment === 'at_risk') query.last_visit = { $lt: new Date(now - 14 * 24 * 60 * 60 * 1000) };
    else if (segment === 'vip') query.tier = 'gold';

    const total = await LoyaltyCard.countDocuments(query);
    const customers = await LoyaltyCard.find(query)
      .populate('customer_id', 'name phone createdAt')
      .sort({ points_balance: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ customers, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

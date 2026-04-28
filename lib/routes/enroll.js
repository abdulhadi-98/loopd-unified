const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Customer = require('../models/Customer');
const LoyaltyCard = require('../models/LoyaltyCard');
const Transaction = require('../models/Transaction');
const Restaurant = require('../models/Restaurant');
const appleWallet = require('../services/appleWallet');
const googleWallet = require('../services/googleWallet');

const router = express.Router();

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, phone, restaurantId, notificationChannel } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({ name, phone, phone_verified: true });
    }

    let card = await LoyaltyCard.findOne({ customer_id: customer._id, restaurant_id: restaurantId });
    if (!card) {
      card = await LoyaltyCard.create({
        customer_id: customer._id,
        restaurant_id: restaurantId,
        notification_channel: notificationChannel || 'web',
      });

      // Welcome bonus
      card.points_balance = 50;
      await card.save();
      await Transaction.create({
        card_id: card._id,
        type: 'bonus',
        points_delta: 50,
        points_after: 50,
        note: 'Welcome bonus',
      });
    }

    let passData, googleWalletUrl;

    if (notificationChannel === 'apple') {
      const buffer = await appleWallet.generatePass(customer, card, restaurant);
      passData = buffer.toString('base64');
      card.apple_serial = card._id.toString();
      await card.save();
    } else if (notificationChannel === 'google') {
      const result = await googleWallet.createLoyaltyObject(customer, card, restaurant);
      card.google_object_id = result.objectId;
      await card.save();
      googleWalletUrl = result.saveUrl;
    }

    res.json({
      card,
      passData: passData || undefined,
      googleWalletUrl: googleWalletUrl || undefined,
      webCardUrl: `/my-card?cardId=${card._id}`,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/my-card', authMiddleware, async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const { customerId } = req.user;

    const card = await LoyaltyCard.findOne({ customer_id: customerId, restaurant_id: restaurantId })
      .populate('customer_id', 'name phone')
      .populate('restaurant_id', 'name brand_color accent_color logo_url reward_threshold');

    if (!card) return res.status(404).json({ error: 'Card not found' });

    const transactions = await Transaction.find({ card_id: card._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ card, transactions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

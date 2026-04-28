const express = require('express');
const { staffOnly } = require('../middleware/auth');
const restaurantScope = require('../middleware/restaurantScope');
const LoyaltyCard = require('../models/LoyaltyCard');
const Restaurant = require('../models/Restaurant');
const { addPoints, redeemPoints } = require('../services/points');
const { notifyCustomer } = require('../services/notifications');
const googleWallet = require('../services/googleWallet');

const router = express.Router();

router.post('/', staffOnly, restaurantScope, async (req, res, next) => {
  try {
    const { qrValue } = req.body;
    const card = await LoyaltyCard.findOne({ qr_value: qrValue })
      .populate('customer_id', 'name phone')
      .populate('restaurant_id', 'name points_per_100 reward_threshold brand_color');

    if (!card) return res.status(404).json({ error: 'QR code not found' });

    const suggestedPoints = card.restaurant_id.points_per_100;
    res.json({ customer: card.customer_id, card, suggestedPoints });
  } catch (err) {
    next(err);
  }
});

router.post('/points/add', staffOnly, restaurantScope, async (req, res, next) => {
  try {
    const { cardId, billAmount, pointsOverride } = req.body;
    const restaurant = req.restaurant;

    const result = await addPoints(cardId, req.user.staffId, billAmount, pointsOverride, restaurant);

    // Update wallet passes
    if (result.card.google_object_id) {
      googleWallet.updatePoints(result.card.google_object_id, result.newBalance).catch(console.error);
    }

    const notifTitle = result.rewardUnlocked
      ? '🎉 Reward Unlocked!'
      : `+${result.pointsAdded} points added`;
    const notifBody = result.rewardUnlocked
      ? `You earned a free reward at ${restaurant.name}!`
      : `Balance: ${result.newBalance} pts`;

    notifyCustomer(result.card, { title: notifTitle, body: notifBody, type: result.rewardUnlocked ? 'reward' : 'earn' }).catch(console.error);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/points/redeem', staffOnly, restaurantScope, async (req, res, next) => {
  try {
    const { cardId } = req.body;
    const restaurant = req.restaurant;

    const result = await redeemPoints(cardId, req.user.staffId, restaurant);

    if (result.card.google_object_id) {
      googleWallet.updatePoints(result.card.google_object_id, result.newBalance).catch(console.error);
    }

    notifyCustomer(result.card, {
      title: 'Reward Redeemed!',
      body: `Enjoy your ${restaurant.reward_description} 🎉`,
      type: 'redeem',
    }).catch(console.error);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const LoyaltyCard = require('../models/LoyaltyCard');

const router = express.Router();

router.post('/subscribe', authMiddleware, async (req, res, next) => {
  try {
    const { subscription, cardId } = req.body;
    await LoyaltyCard.findByIdAndUpdate(cardId, {
      web_push_endpoint: subscription.endpoint,
      web_push_p256dh: subscription.keys.p256dh,
      web_push_auth: subscription.keys.auth,
      notification_channel: 'web',
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/unsubscribe', authMiddleware, async (req, res, next) => {
  try {
    const { cardId } = req.body;
    await LoyaltyCard.findByIdAndUpdate(cardId, {
      $unset: { web_push_endpoint: '', web_push_p256dh: '', web_push_auth: '' },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

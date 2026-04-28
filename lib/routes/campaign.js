const express = require('express');
const { managerOnly } = require('../middleware/auth');
const restaurantScope = require('../middleware/restaurantScope');
const LoyaltyCard = require('../models/LoyaltyCard');
const Campaign = require('../models/Campaign');
const { notifyCustomer } = require('../services/notifications');

const router = express.Router();

function buildSegmentQuery(restaurantId, segment) {
  const base = { restaurant_id: restaurantId };
  const now = new Date();
  if (segment === 'active') {
    return { ...base, last_visit: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
  }
  if (segment === 'at_risk') {
    return { ...base, last_visit: { $lt: new Date(now - 14 * 24 * 60 * 60 * 1000) } };
  }
  if (segment === 'vip') {
    return { ...base, tier: 'gold' };
  }
  return base;
}

router.post('/send', managerOnly, restaurantScope, async (req, res, next) => {
  try {
    const { message, segment = 'all', title = 'Message from us' } = req.body;
    const restaurant = req.restaurant;

    const query = buildSegmentQuery(restaurant._id, segment);
    const cards = await LoyaltyCard.find(query);

    let sent = 0;
    let failed = 0;

    for (const card of cards) {
      try {
        await notifyCustomer(card, { title, body: message, type: 'campaign' });
        sent++;
      } catch {
        failed++;
      }
    }

    const campaign = await Campaign.create({
      restaurant_id: restaurant._id,
      title,
      message,
      segment,
      status: 'sent',
      sent_count: sent,
      sent_at: new Date(),
    });

    res.json({ sent, failed, campaignId: campaign._id });
  } catch (err) {
    next(err);
  }
});

router.get('/', managerOnly, restaurantScope, async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ restaurant_id: req.restaurant._id }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

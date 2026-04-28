const express = require('express');
const LoyaltyCard = require('../models/LoyaltyCard');
const Restaurant = require('../models/Restaurant');
const appleWallet = require('../services/appleWallet');
const googleWallet = require('../services/googleWallet');

const router = express.Router();

// Apple Wallet — return current pass for update service
router.get('/apple/:serialNumber', async (req, res, next) => {
  try {
    const card = await LoyaltyCard.findOne({ apple_serial: req.params.serialNumber })
      .populate('customer_id')
      .populate('restaurant_id');
    if (!card) return res.status(404).json({ error: 'Pass not found' });

    const buffer = await appleWallet.generatePass(card.customer_id, card, card.restaurant_id);
    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// Register APNS push token
router.post('/apple/:serialNumber/register', async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    await LoyaltyCard.updateOne(
      { apple_serial: req.params.serialNumber },
      { apple_push_token: pushToken }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/apple/:serialNumber/unregister', async (req, res, next) => {
  try {
    await LoyaltyCard.updateOne(
      { apple_serial: req.params.serialNumber },
      { $unset: { apple_push_token: '' } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Google Wallet save URL
router.get('/google/save-url', async (req, res, next) => {
  try {
    const { cardId } = req.query;
    const card = await LoyaltyCard.findById(cardId).populate('customer_id').populate('restaurant_id');
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const result = await googleWallet.createLoyaltyObject(card.customer_id, card, card.restaurant_id);
    res.json({ saveUrl: result.saveUrl });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

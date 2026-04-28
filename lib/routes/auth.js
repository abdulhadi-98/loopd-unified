const express = require('express');
const jwt = require('jsonwebtoken');
const { sendOtp, verifyOtp } = require('../services/otp');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');

const router = express.Router();

router.post('/send-otp', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });
    const result = await sendOtp(phone);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const valid = await verifyOtp(phone, code);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired OTP' });

    let customer = await Customer.findOne({ phone });
    const isNewUser = !customer;

    if (customer) {
      customer.phone_verified = true;
      await customer.save();
    }

    const payload = { phone, customerId: customer?._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({ verified: true, token, isNewUser, customerId: customer?._id });
  } catch (err) {
    next(err);
  }
});

router.post('/staff-login', async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const valid = await verifyOtp(phone, code);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const staff = await Staff.findOne({ phone });
    if (!staff) return res.status(404).json({ error: 'Staff account not found' });

    const token = jwt.sign(
      { staffId: staff._id, restaurant_id: staff.restaurant_id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, staff: { id: staff._id, name: staff.name, role: staff.role, restaurant_id: staff.restaurant_id } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

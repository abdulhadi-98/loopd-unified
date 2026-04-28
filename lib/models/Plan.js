const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g. Starter, Growth, Pro
  price_monthly: { type: Number, required: true },  // PKR
  max_customers: { type: Number, default: 500 },
  max_staff: { type: Number, default: 5 },
  features: {
    apple_wallet: { type: Boolean, default: false },
    google_wallet: { type: Boolean, default: false },
    campaigns: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    custom_branding: { type: Boolean, default: false },
  },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);

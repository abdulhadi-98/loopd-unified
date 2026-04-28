const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, unique: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  status: { type: String, enum: ['active', 'trial', 'suspended', 'cancelled'], default: 'trial' },
  trial_ends_at: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  current_period_start: Date,
  current_period_end: Date,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

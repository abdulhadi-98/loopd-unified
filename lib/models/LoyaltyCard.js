const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const loyaltyCardSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  qr_value: { type: String, unique: true, default: () => uuidv4() },
  points_balance: { type: Number, default: 0 },
  total_visits: { type: Number, default: 0 },
  total_spend: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
  apple_serial: { type: String, unique: true, sparse: true },
  apple_push_token: String,
  google_object_id: { type: String, unique: true, sparse: true },
  web_push_endpoint: String,
  web_push_p256dh: String,
  web_push_auth: String,
  notification_channel: { type: String, default: 'web' },
  last_visit: Date,
  enrolled_at: { type: Date, default: Date.now },
}, { timestamps: true });

loyaltyCardSchema.index({ qr_value: 1 });
loyaltyCardSchema.index({ customer_id: 1, restaurant_id: 1 }, { unique: true });

module.exports = mongoose.model('LoyaltyCard', loyaltyCardSchema);

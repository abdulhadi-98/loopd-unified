const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo_url: String,
  brand_color: { type: String, default: '#000000' },
  accent_color: { type: String, default: '#ffffff' },
  points_per_100: { type: Number, default: 10 },
  reward_threshold: { type: Number, default: 300 },
  reward_description: { type: String, default: 'Free item of your choice' },
  apple_pass_type_id: String,
  google_class_id: String,
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);

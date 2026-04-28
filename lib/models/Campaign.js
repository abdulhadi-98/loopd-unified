const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  segment: { type: String, default: 'all' },
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  sent_count: { type: Number, default: 0 },
  scheduled_at: Date,
  sent_at: Date,
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LoyaltyCard', required: true },
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  type: { type: String, enum: ['earn', 'redeem', 'bonus', 'adjustment'], required: true },
  bill_amount: Number,
  points_delta: { type: Number, required: true },
  points_after: { type: Number, required: true },
  note: String,
}, { timestamps: true });

transactionSchema.index({ card_id: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

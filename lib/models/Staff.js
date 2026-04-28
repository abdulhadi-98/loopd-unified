const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['cashier', 'manager', 'owner'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);

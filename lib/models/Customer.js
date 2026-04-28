const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  phone_verified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);

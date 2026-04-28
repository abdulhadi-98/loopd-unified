const mongoose = require('mongoose');

const otpCodeSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

otpCodeSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpCode', otpCodeSchema);

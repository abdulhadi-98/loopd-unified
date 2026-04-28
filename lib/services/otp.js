const twilio = require('twilio');
const OtpCode = require('../models/OtpCode');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOtp(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000);

  await OtpCode.create({ phone, code, expires_at });

  await client.messages.create({
    body: `Your Loyalr verification code is: ${code}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_VERIFY_SERVICE_SID,
    to: phone,
  });

  return { expiresIn: 300 };
}

async function verifyOtp(phone, code) {
  const otp = await OtpCode.findOne({
    phone,
    code,
    used: false,
    expires_at: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otp) return false;

  otp.used = true;
  await otp.save();
  return true;
}

module.exports = { sendOtp, verifyOtp };

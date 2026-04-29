const axios = require('axios');
const OtpCode = require('../models/OtpCode');

const META_API_URL = `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

async function sendOtp(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000);

  await OtpCode.create({ phone, code, expires_at });

  await axios.post(
    META_API_URL,
    {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: process.env.META_WA_TEMPLATE_NAME || 'loopd_otp',
        language: { code: process.env.META_WA_TEMPLATE_LANG || 'en' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: code }],
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

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

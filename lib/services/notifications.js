const appleWallet = require('./appleWallet');
const googleWallet = require('./googleWallet');
const { sendPush } = require('./webPush');

async function notifyCustomer(card, { title, body, type }) {
  const results = [];

  if (card.apple_push_token && card.apple_serial) {
    try {
      await appleWallet.pushUpdate(card.apple_serial, card.apple_push_token);
      results.push('apple');
    } catch (e) {
      console.error('Apple push failed:', e.message);
    }
  }

  if (card.google_object_id) {
    try {
      await googleWallet.sendMessage(card.google_object_id, { title, body });
      results.push('google');
    } catch (e) {
      console.error('Google wallet message failed:', e.message);
    }
  }

  if (card.web_push_endpoint) {
    try {
      await sendPush(
        { endpoint: card.web_push_endpoint, keys: { p256dh: card.web_push_p256dh, auth: card.web_push_auth } },
        { title, body, data: { type } }
      );
      results.push('web');
    } catch (e) {
      console.error('Web push failed:', e.message);
    }
  }

  return results;
}

module.exports = { notifyCustomer };

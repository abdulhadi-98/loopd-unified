const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPush(subscription, payload) {
  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/badge.png',
      data: payload.data || {},
    })
  );
}

module.exports = { sendPush };

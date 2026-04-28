const { PKPass } = require('passkit-generator');
const apn = require('@parse/node-apn');
const path = require('path');

async function generatePass(customer, card, restaurant) {
  const pass = await PKPass.from(
    {
      model: path.resolve(__dirname, '../../passes/'),
      certificates: {
        wwdr: process.env.APPLE_WWDR_CERT,
        signerCert: process.env.APPLE_SIGNER_CERT,
        signerKey: process.env.APPLE_SIGNER_KEY,
        signerKeyPassphrase: process.env.APPLE_KEY_PASSPHRASE,
      },
    },
    {
      serialNumber: card._id.toString(),
      description: `${restaurant.name} Loyalty Card`,
      organizationName: restaurant.name,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
      teamIdentifier: process.env.APPLE_TEAM_ID,
      backgroundColor: restaurant.brand_color,
      foregroundColor: restaurant.accent_color,
      storeCard: {
        headerFields: [{ key: 'points', label: 'POINTS', value: card.points_balance }],
        primaryFields: [{ key: 'name', label: 'MEMBER', value: customer.name }],
        secondaryFields: [
          { key: 'tier', label: 'TIER', value: card.tier.toUpperCase() },
          { key: 'reward', label: 'REWARD AT', value: `${restaurant.reward_threshold} pts` },
        ],
        backFields: [
          { key: 'about', label: 'About', value: restaurant.reward_description },
          { key: 'balance', label: 'Point Balance', value: `${card.points_balance} points` },
        ],
      },
      barcode: {
        message: card.qr_value,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      },
      webServiceURL: `${process.env.API_BASE_URL}/api/wallet/apple`,
      authenticationToken: process.env.APPLE_AUTH_TOKEN,
    }
  );

  return pass.getAsBuffer();
}

async function pushUpdate(serialNumber, pushToken) {
  const provider = new apn.Provider({
    token: {
      key: process.env.APPLE_SIGNER_KEY,
      keyId: process.env.APPLE_KEY_ID,
      teamId: process.env.APPLE_TEAM_ID,
    },
    production: process.env.NODE_ENV === 'production',
  });

  const notification = new apn.Notification();
  notification.topic = process.env.APPLE_PASS_TYPE_ID;

  await provider.send(notification, pushToken);
  provider.shutdown();
}

module.exports = { generatePass, pushUpdate };

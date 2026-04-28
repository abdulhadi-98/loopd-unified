const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const WALLET_API = 'https://walletobjects.googleapis.com/walletobjects/v1';

async function getAuthToken() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

function classId(restaurantSlug) {
  return `${process.env.GOOGLE_ISSUER_ID}.${restaurantSlug}`;
}

async function ensureClass(restaurant) {
  const token = await getAuthToken();
  const cid = classId(restaurant.slug);
  try {
    await axios.get(`${WALLET_API}/loyaltyClass/${cid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    await axios.post(
      `${WALLET_API}/loyaltyClass`,
      {
        id: cid,
        issuerName: restaurant.name,
        programName: `${restaurant.name} Rewards`,
        programLogo: { sourceUri: { uri: restaurant.logo_url || '' } },
        rewardsTierLabel: 'Tier',
        reviewStatus: 'UNDER_REVIEW',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
  return cid;
}

async function createLoyaltyObject(customer, card, restaurant) {
  const token = await getAuthToken();
  const cid = await ensureClass(restaurant);
  const objectId = `${cid}.${card._id}`;

  const loyaltyObject = {
    id: objectId,
    classId: cid,
    state: 'ACTIVE',
    accountId: customer.phone,
    accountName: customer.name,
    loyaltyPoints: { label: 'Points', balance: { int: card.points_balance } },
    secondaryLoyaltyPoints: {
      label: 'Next Reward',
      balance: { int: Math.max(0, restaurant.reward_threshold - card.points_balance) },
    },
    barcode: { type: 'QR_CODE', value: card.qr_value, alternateText: card.qr_value.substring(0, 8) },
    heroImage: restaurant.logo_url ? { sourceUri: { uri: restaurant.logo_url } } : undefined,
  };

  await axios.post(`${WALLET_API}/loyaltyObject`, loyaltyObject, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { objectId, saveUrl: buildSaveUrl(loyaltyObject, restaurant) };
}

function buildSaveUrl(loyaltyObject, restaurant) {
  const serviceAccountEmail = JSON.parse(
    fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ).client_email;

  const claims = {
    iss: serviceAccountEmail,
    aud: 'google',
    origins: [],
    typ: 'savetowallet',
    payload: { loyaltyObjects: [{ id: loyaltyObject.id }] },
  };

  const privateKey = JSON.parse(
    fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ).private_key;

  const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' });
  return `https://pay.google.com/gp/v/save/${token}`;
}

async function updatePoints(googleObjectId, newBalance) {
  const token = await getAuthToken();
  await axios.patch(
    `${WALLET_API}/loyaltyObject/${googleObjectId}`,
    { loyaltyPoints: { balance: { int: newBalance } } },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function sendMessage(googleObjectId, { title, body }) {
  const token = await getAuthToken();
  await axios.post(
    `${WALLET_API}/loyaltyObject/${googleObjectId}/addMessage`,
    { message: { header: title, body } },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

module.exports = { createLoyaltyObject, updatePoints, sendMessage };

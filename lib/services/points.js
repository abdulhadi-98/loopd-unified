const LoyaltyCard = require('../models/LoyaltyCard');
const Transaction = require('../models/Transaction');

function calcTier(balance) {
  if (balance >= 1000) return 'gold';
  if (balance >= 500) return 'silver';
  return 'bronze';
}

async function addPoints(cardId, staffId, billAmount, pointsOverride, restaurant) {
  const card = await LoyaltyCard.findById(cardId);
  if (!card) throw Object.assign(new Error('Card not found'), { status: 404 });

  const pointsToAdd = pointsOverride != null
    ? pointsOverride
    : Math.floor((billAmount / 100) * restaurant.points_per_100);

  const previousBalance = card.points_balance;
  card.points_balance += pointsToAdd;
  card.total_visits += 1;
  card.total_spend += billAmount || 0;
  card.last_visit = new Date();
  card.tier = calcTier(card.points_balance);

  await card.save();

  await Transaction.create({
    card_id: cardId,
    staff_id: staffId,
    type: 'earn',
    bill_amount: billAmount,
    points_delta: pointsToAdd,
    points_after: card.points_balance,
  });

  const rewardUnlocked =
    previousBalance < restaurant.reward_threshold &&
    card.points_balance >= restaurant.reward_threshold;

  return { pointsAdded: pointsToAdd, newBalance: card.points_balance, tier: card.tier, rewardUnlocked, card };
}

async function redeemPoints(cardId, staffId, restaurant) {
  const card = await LoyaltyCard.findById(cardId);
  if (!card) throw Object.assign(new Error('Card not found'), { status: 404 });
  if (card.points_balance < restaurant.reward_threshold) {
    throw Object.assign(new Error('Insufficient points'), { status: 400 });
  }

  const deducted = restaurant.reward_threshold;
  card.points_balance -= deducted;
  card.tier = calcTier(card.points_balance);
  await card.save();

  await Transaction.create({
    card_id: cardId,
    staff_id: staffId,
    type: 'redeem',
    points_delta: -deducted,
    points_after: card.points_balance,
    note: restaurant.reward_description,
  });

  return { pointsDeducted: deducted, newBalance: card.points_balance, card };
}

module.exports = { addPoints, redeemPoints };

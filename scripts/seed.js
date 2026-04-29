require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ──────────────────────────────────────────────────────────────────
const Plan      = require('../lib/models/Plan');
const SuperAdmin = require('../lib/models/SuperAdmin');

// ── Config — change these before running ────────────────────────────────────
const SUPERADMIN = {
  name:     process.env.SEED_ADMIN_NAME     || 'Super Admin',
  email:    process.env.SEED_ADMIN_EMAIL    || 'admin@loyalr.app',
  password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
};

const PLANS = [
  {
    name: 'Starter',
    price_monthly: 4999,
    max_customers: 500,
    max_staff: 3,
    features: {
      apple_wallet: false,
      google_wallet: false,
      campaigns: false,
      analytics: true,
      custom_branding: false,
    },
  },
  {
    name: 'Growth',
    price_monthly: 12999,
    max_customers: 3000,
    max_staff: 10,
    features: {
      apple_wallet: true,
      google_wallet: true,
      campaigns: true,
      analytics: true,
      custom_branding: false,
    },
  },
  {
    name: 'Pro',
    price_monthly: 29999,
    max_customers: 999999,
    max_staff: 999,
    features: {
      apple_wallet: true,
      google_wallet: true,
      campaigns: true,
      analytics: true,
      custom_branding: true,
    },
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  // Plans
  const planCount = await Plan.countDocuments();
  if (planCount === 0) {
    await Plan.insertMany(PLANS);
    console.log('✓ Plans seeded (Starter, Growth, Pro)');
  } else {
    console.log(`- Plans already exist (${planCount} found), skipping`);
  }

  // SuperAdmin
  const existing = await SuperAdmin.findOne({ email: SUPERADMIN.email });
  if (!existing) {
    const hashed = await bcrypt.hash(SUPERADMIN.password, 10);
    await SuperAdmin.create({ ...SUPERADMIN, password: hashed });
    console.log(`✓ Superadmin created: ${SUPERADMIN.email} / ${SUPERADMIN.password}`);
  } else {
    console.log(`- Superadmin already exists (${SUPERADMIN.email}), skipping`);
  }

  await mongoose.disconnect();
  console.log('\nDone. You can now log in at /admin/login');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

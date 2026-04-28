require('dotenv').config();
const express = require('express');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// API routes
const authRoutes = require('./lib/routes/auth');
const enrollRoutes = require('./lib/routes/enroll');
const walletRoutes = require('./lib/routes/wallet');
const scanRoutes = require('./lib/routes/scan');
const pushRoutes = require('./lib/routes/push');
const campaignRoutes = require('./lib/routes/campaign');
const dashboardRoutes = require('./lib/routes/dashboard');
const superadminRoutes = require('./lib/routes/superadmin');

nextApp.prepare().then(async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });

  app.set('io', io);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

  // All API routes under /api
  app.use('/api/auth', authRoutes);
  app.use('/api/enroll', enrollRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/scan', scanRoutes);
  app.use('/api/push', pushRoutes);
  app.use('/api/campaign', campaignRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/superadmin', superadminRoutes);

  // Next.js handles everything else
  app.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  await seedDefaultPlans();
  startChangeStreams(io);

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => console.log(`Loyalr running on http://localhost:${PORT}`));
});

async function seedDefaultPlans() {
  const Plan = require('./lib/models/Plan');
  const count = await Plan.countDocuments();
  if (count > 0) return;
  await Plan.insertMany([
    { name: 'Starter', price_monthly: 4999, max_customers: 500, max_staff: 3,
      features: { apple_wallet: false, google_wallet: false, campaigns: false, analytics: true, custom_branding: false } },
    { name: 'Growth', price_monthly: 12999, max_customers: 3000, max_staff: 10,
      features: { apple_wallet: true, google_wallet: true, campaigns: true, analytics: true, custom_branding: false } },
    { name: 'Pro', price_monthly: 29999, max_customers: 999999, max_staff: 999,
      features: { apple_wallet: true, google_wallet: true, campaigns: true, analytics: true, custom_branding: true } },
  ]);
  console.log('Default plans seeded');
}

function startChangeStreams(io) {
  const Transaction = require('./lib/models/Transaction');
  const LoyaltyCard = require('./lib/models/LoyaltyCard');
  Transaction.watch().on('change', (c) => {
    if (c.operationType === 'insert') io.emit('transaction:new', c.fullDocument);
  });
  LoyaltyCard.watch().on('change', (c) => {
    if (['insert', 'update'].includes(c.operationType))
      io.emit('card:update', c.fullDocument || c.documentKey);
  });
}

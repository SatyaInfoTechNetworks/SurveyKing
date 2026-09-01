const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const telegramController = require('./controllers/telegramController');
const webhookController = require('./controllers/webhookController');
const adminController = require('./controllers/adminController');
const { initBot } = require('./bot/telegramBot');

const app = express();
const PORT = process.env.PORT || 5000;

const fs = require('fs');

// Global Uncaught Exception & Rejection Handlers
process.on('uncaughtException', (err) => {
  console.error(`💥 [${new Date().toISOString()}] UNCAUGHT EXCEPTION:`, err);
});

process.on('unhandledRejection', (reason) => {
  console.error(`💥 [${new Date().toISOString()}] UNHANDLED REJECTION:`, reason);
});

// Extract Real Client IP from Proxy Headers (Cloudflare / Traefik / NGINX)
function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return cfIp;
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) return realIp;
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log Every Incoming HTTP Request with Full Details to Dokploy Console
app.use((req, res, next) => {
  const clientIp = getClientIp(req);
  req.clientIp = clientIp;
  console.log(`----------------------------------------------------`);
  console.log(`📥 [INCOMING HTTP ${req.method}] ${req.originalUrl || req.url}`);
  console.log(`🌐 Client IP: ${clientIp} | User-Agent: ${req.headers['user-agent'] || 'N/A'}`);
  if (Object.keys(req.query || {}).length > 0) {
    console.log(`🔍 Query Params:`, JSON.stringify(req.query));
  }
  if (Object.keys(req.body || {}).length > 0) {
    console.log(`📦 Body Payload:`, JSON.stringify(req.body));
  }
  console.log(`----------------------------------------------------`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Serve Production Frontend Build if available
const frontendDistPath = path.join(__dirname, '../Frontend/dist');
const backendDistPath = path.join(__dirname, 'dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else if (fs.existsSync(backendDistPath)) {
  app.use(express.static(backendDistPath));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'Survey King Backend API',
    dbMode: db.getMode(),
    timestamp: new Date().toISOString()
  });
});

// Simulator route
app.get('/api/simulator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simulator.html'));
});

// Telegram APIs
app.post('/api/telegram/auth', telegramController.handleAuth);
app.get('/api/telegram/me', telegramController.getMe);
app.get('/api/telegram/surveys', telegramController.getSurveys);
app.post('/api/telegram/surveys/:id/start', telegramController.startSurvey);
app.get('/api/telegram/transactions', telegramController.getTransactions);
app.get('/api/telegram/referrals', telegramController.getReferrals);
app.post('/api/telegram/withdraw', telegramController.requestWithdrawal);

// Webhook APIs (CPX Research & TimeWall)
app.all('/cpx', webhookController.handleWebhook);
app.all('/api/cpx', webhookController.handleWebhook);
app.all('/postback', webhookController.handleWebhook);
app.all('/api/postback', webhookController.handleWebhook);
app.all('/postback/timewall', webhookController.handleTimeWallWebhook);
app.all('/api/postback/timewall', webhookController.handleTimeWallWebhook);
app.all('/timewall', webhookController.handleTimeWallWebhook);
app.all('/api/timewall', webhookController.handleTimeWallWebhook);
app.all('/api/webhooks/cpx', webhookController.handleWebhook);
app.all('/api/webhooks/surveys/cpx', webhookController.handleWebhook);
app.all('/api/webhooks/surveys/:provider', webhookController.handleWebhook);

// Admin APIs (All 12 Modules)
// 1. Dashboard
app.get('/api/admin/dashboard', adminController.getDashboardStats);
app.get('/api/admin/stats', adminController.getDashboardStats);

// 2. Users
app.get('/api/admin/users', adminController.getUsers);
app.get('/api/admin/users/:id/details', adminController.getUserDetails);
app.post('/api/admin/users/:id/status', adminController.updateUserStatus);
app.post('/api/admin/users/:id/balance', adminController.updateUserBalance);
app.delete('/api/admin/users/:id', adminController.deleteUser);

// 3. Surveys
app.get('/api/admin/surveys/live', adminController.getLiveSurveys);
app.get('/api/admin/surveys/custom', adminController.getCustomSurveys);
app.post('/api/admin/surveys/custom', adminController.createCustomSurvey);
app.put('/api/admin/surveys/custom/:id', adminController.updateCustomSurvey);
app.delete('/api/admin/surveys/custom/:id', adminController.deleteCustomSurvey);
app.get('/api/admin/surveys/attempts', adminController.getSurveyAttempts);
app.get('/api/admin/surveys', adminController.getCustomSurveys);

// 4. Postbacks & Safe Retry
app.get('/api/admin/postbacks', adminController.getPostbacks);
app.get('/api/admin/postbacks/:id', adminController.getPostbackDetails);
app.post('/api/admin/postbacks/:id/retry', adminController.retryPostback);

// 5. Wallet Ledger
app.get('/api/admin/wallet/ledger', adminController.getWalletLedger);

// 6. Withdrawals
app.get('/api/admin/withdrawals', adminController.getWithdrawals);
app.post('/api/admin/withdrawals/:id/action', adminController.processWithdrawal);

// 7. Referrals
app.get('/api/admin/referrals/list', adminController.getReferralsList);
app.get('/api/admin/referrals/stats', adminController.getReferralsList);
app.get('/api/admin/referral-settings', adminController.getReferralSettings);
app.put('/api/admin/referral-settings', adminController.updateReferralSettings);

// 8. Telegram Bot
app.get('/api/admin/telegram/status', adminController.getTelegramStatus);
app.post('/api/admin/telegram/broadcast', adminController.broadcastTelegram);

// 9. Fraud & Risk Center
app.get('/api/admin/fraud', adminController.getFraudCenter);

// 10. Analytics
app.get('/api/admin/analytics', adminController.getAnalytics);

// 11. Audit Logs
app.get('/api/admin/audit-logs', adminController.getAuditLogs);

// 12. Settings & Payout Methods
app.get('/api/admin/settings', adminController.getSettings);
app.get('/api/admin/payout-methods', adminController.getPayoutMethods);
app.get('/api/telegram/payout-methods', adminController.getPayoutMethods);
app.post('/api/admin/payout-methods', adminController.createPayoutMethod);
app.put('/api/admin/payout-methods/:id', adminController.updatePayoutMethod);
app.delete('/api/admin/payout-methods/:id', adminController.deletePayoutMethod);

// SPA Wildcard Route Fallback for Frontend Single Page App
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (fs.existsSync(path.join(frontendDistPath, 'index.html'))) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
  if (fs.existsSync(path.join(backendDistPath, 'index.html'))) {
    return res.sendFile(path.join(backendDistPath, 'index.html'));
  }
  next();
});

// Start Server
async function startServer() {
  try {
    await db.initDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Survey King Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

    initBot();
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

startServer();

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

// Webhook APIs
app.post('/api/webhooks/surveys/:provider', webhookController.handleWebhook);
app.get('/api/webhooks/surveys/:provider', webhookController.handleWebhook);

// Admin APIs
app.get('/api/admin/stats', adminController.getStats);
app.get('/api/admin/users', adminController.getUsers);
app.post('/api/admin/users/:id/status', adminController.updateUserStatus);
app.post('/api/admin/users/:id/balance', adminController.updateUserBalance);
app.get('/api/admin/withdrawals', adminController.getWithdrawals);
app.post('/api/admin/withdrawals/:id/action', adminController.processWithdrawal);
app.get('/api/admin/surveys', telegramController.getSurveys);
app.post('/api/admin/surveys', adminController.createSurvey);
app.put('/api/admin/surveys/:id', adminController.updateSurvey);
app.delete('/api/admin/surveys/:id', adminController.deleteSurvey);

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

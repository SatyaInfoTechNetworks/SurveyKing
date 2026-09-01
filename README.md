# Survey King 👑 — Telegram WebApp & Backend

Survey King is a simple, fast, and high-payout survey platform built with a Telegram Bot, a React Telegram Mini App (Frontend), and a Node.js Express Backend backed by MySQL database (`surveyking`).

## 👑 Features

- 🪙 **Coins Rewards Engine**: 1,000 Coins = ₹10.00 INR conversion.
- 🎯 **High-Payout Survey Catalog**: Pre-seeded surveys with automated callback verification.
- 👥 **Qualifying Referral System**: Earn 1,500 Coins (₹15) per friend upon completing their first survey.
- 💸 **UPI Payout Withdrawals**: Instant payout request handling (Min 5,000 Coins / ₹50).
- 🛡️ **Double-Payout Protection**: Idempotent provider completion webhook engine.
- 🤖 **Telegram Bot Integration**: Commands `/start` and `/start <referralCode>` with interactive WebApp buttons.

## 🚀 Quick Start

### Backend Setup
```bash
cd Backend
npm install
node server.js
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

## 🗄️ Database Tables (MySQL)
- `users`: User identity, balance, referral code.
- `surveys`: Catalog of available surveys.
- `survey_participations`: Participation tracking & webhook verification.
- `wallet_transactions`: Credit & debit history.
- `referrals`: Referral tracking & status.
- `withdrawals`: UPI payout requests.

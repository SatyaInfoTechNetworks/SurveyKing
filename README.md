# 👑 Survey King — Official Platform & Technical Documentation

Welcome to **Survey King 👑**, a state-of-the-art Telegram Mini App, Web Application, and Paid Surveys Rewards Engine.

---

## 📌 1. Executive Summary & Architecture

| Component | Specification / Configuration |
| :--- | :--- |
| **Live Web App & Mini App** | [https://surveyking.satyainfotechnetworks.com](https://surveyking.satyainfotechnetworks.com) |
| **Telegram Mini App Route** | [https://surveyking.satyainfotechnetworks.com/app](https://surveyking.satyainfotechnetworks.com/app) |
| **Admin Panel Route** | [https://surveyking.satyainfotechnetworks.com/admin](https://surveyking.satyainfotechnetworks.com/admin) |
| **Telegram Bot Username** | [@survey_king_bot](https://t.me/survey_king_bot) |
| **Telegram Bot Token** | `8475884062:AAEqlturM37exHu1AcrcXBp7NDKWxiYxkmI` |
| **Economy Exchange Rate** | **1,000 Coins = ₹10.00 INR** (100 Coins = ₹1.00 INR) |
| **Minimum Withdrawal Tier** | **2,500 Coins = ₹5.00 INR** |
| **First Survey Qualification Rule** | **≥ 100 Coins** completion required for referral qualification |
| **Backend Technology Stack** | Node.js, Express, MySQL (`surveyking`), Telegram Bot API |
| **Frontend Technology Stack** | React, Vite, Lucide Icons, Glassmorphism CSS |
| **CPX Research App ID** | `35805` |
| **CPX Security Hash** | `rocaZHPRG8u3oHgTTJb5Yuwccm45kmlF` |
| **Database Name** | `surveyking` (Strict MySQL Engine) |

---

## 📱 2. User Experience & Mini App Documentation

The **Survey King Mini App** is accessible inside Telegram or via any browser at `/app`.

### 🏠 Home Tab
- **Balance Hero Card**: Displays user's live Coin balance and equivalent INR payout value (`≈ ₹XX.XX INR`).
- **Quick Action Buttons**: Direct 1-click access to **Take Surveys** and **Withdraw Payout**.
- **User Activity Stats**:
  - `Today`: Coins earned today.
  - `This Week`: Coins earned this week.
  - `Completed`: Total surveys completed count.
- **Highest Coin Rewards Grid**: Displays top high-paying available surveys.

### 🎯 Surveys Tab
- **Category Filter Pills**: Filter surveys by `ALL`, `Technology`, `Shopping`, `Lifestyle`, `Finance`.
- **Live CPX Surveys**: Directly fetches geo-targeted live surveys from CPX Research API.
- **Survey Card Specifications**:
  - Survey Title & Provider Badge (`CPX Research Live`).
  - Single-line Gold Reward Badge (`+8,200 🪙`).
  - Estimated Duration (`⏱️ X mins`) and Estimated Rupee Value (`≈ ₹XX INR`).
  - `▶️ Start Survey` action button generating secure CPX survey link.

### 💸 Earnings & Withdrawals Tab
- **Supported Payment Methods**:
  1. ⚡ **UPI Transfer (VPA)** (e.g. `user@paytm`, `mobile@ybl`)
  2. 🎁 **Amazon Pay Gift Card**
  3. 📲 **Paytm Wallet Cash**
  4. 🎮 **Google Play Gift Code**
- **Configurable Coin Tiers**:
  - `2,500 Coins` = **₹5.00 INR**
  - `5,000 Coins` = **₹10.00 INR**
  - `10,000 Coins` = **₹20.00 INR**
  - `25,000 Coins` = **₹50.00 INR**
  - `50,000 Coins` = **₹100.00 INR**
- **Transaction History Log**: Full ledger of survey earnings, referral rewards, and withdrawal statuses (`PENDING`, `APPROVED`, `REJECTED`).

### 👥 Profile & Referral Engine
- **Unique Referral Link**: `https://t.me/survey_king_bot?start=<REFERRAL_CODE>`
- **1-Click Share**: Built-in Telegram share button with pre-formatted invite copy.
- **Dual Referral Rewards**:
  - **Inviter Reward**: Earns `1,000 Coins` (₹10.00) when referred friend qualifies.
  - **Friend Welcome Bonus**: Receives `500 Coins` (₹5.00) bonus upon completing first survey.
- **First Survey Qualification Rule**: Referral status changes from `PENDING` to `QUALIFIED` **only when the referred user completes their first survey of at least 100 Coins (`≥ 100 🪙`)**.

---

## ⚙️ 3. Admin Panel & Management Engine Documentation

Access URL: **[https://surveyking.satyainfotechnetworks.com/admin](https://surveyking.satyainfotechnetworks.com/admin)**

### 📊 Tab 1: Overview KPIs
- **Total Users**: Real-time registered user count.
- **Total Coins Issued**: Total coins distributed across survey completions & referral bonuses.
- **Pending Payout Requests**: Active withdrawal queue count.
- **Total Paid Out**: Total INR amount processed and approved.

### 👥 Tab 2: User Management
- **Search Engine**: Search users by Name, Username, or Telegram User ID.
- **Status Control**: Toggle user status between `ACTIVE` and `BANNED`. Banned users are instantly blocked from accessing APIs and withdrawing.
- **Manual Balance Adjustments**: Credit or debit user Coin balance with custom audit descriptions (`ADMIN_ADJUSTMENT`).

### 💳 Tab 3: Withdrawal Approval Queue
- **Filter Queue**: View `PENDING`, `APPROVED`, or `REJECTED` payout requests.
- **Approve Payout**: Marks withdrawal as `APPROVED` and triggers an automated **Telegram Notification** to the user with payout details.
- **Reject & Refund**: Marks withdrawal as `REJECTED`, **automatically refunds the exact Coin amount back to the user's wallet**, logs a `WITHDRAWAL_REFUND` transaction, and sends an automated Telegram notification to the user explaining the refund.

### 👥 Tab 4: Referral Rules Engine
- **Inviter Reward Coins**: Modify coins awarded to the inviter (default: `1,000 🪙`).
- **Referee Welcome Coins**: Modify bonus coins awarded to the invited friend (default: `500 🪙`).
- **Minimum First Survey Coins**: Configure minimum survey payout required to trigger referral qualification (default: `100 🪙`).
- **Trigger Rule**: Toggle between `FIRST_SURVEY` qualification or `ON_JOIN` immediate qualification.

### 💸 Tab 5: Payout Options & Tiers Management
- **Payment Method Toggle**: Enable or disable specific payout options (`UPI`, `AMAZON`, `PAYTM`, `GOOGLE_PLAY`).
- **Tier Configuration**: Customize coin requirements and rupee values per payment method.

### 🎯 Tab 6: Custom Survey Creator
- **Create Custom Surveys**: Add custom survey cards to the user dashboard with:
  - Survey Title & Survey ID
  - Reward Coins (e.g. `5,000 🪙`)
  - Estimated Minutes (e.g. `8 mins`)
  - Category & Icon (`🎯`, `🔥`, `💻`, `🛒`)
  - Direct Entry URL link

---

## 📡 4. CPX Research API & Postback Webhook Setup

### 🔗 Main Postback URL Configuration
Paste this exact URL into your **CPX Publisher Dashboard** (`publisher.cpx-research.com` -> App `35805` -> Postback Settings):

```text
https://surveyking.satyainfotechnetworks.com/api/webhooks/surveys/cpx?status={status}&trans_id={trans_id}&user_id={user_id}&sub_id={subid}&sub_id_2={subid_2}&amount_local={amount_local}&amount_usd={amount_usd}&offer_id={offer_ID}&hash={secure_hash}&ip_click={ip_click}
```

### ⚙️ Postback Parameter Handling Matrix
| CPX Parameter | Meaning / Purpose | Backend Action |
| :--- | :--- | :--- |
| `status` | `1` = Completed, `2` = Canceled | Marks survey `COMPLETED` or `CANCELED` |
| `trans_id` | Unique Participation / Transaction ID | Checks idempotency (prevents double crediting) |
| `user_id` | User's Telegram User ID | Credits Coins to user's database balance |
| `amount_local` | Reward amount in Coins | Adds to user balance & checks referral qualification |
| **Response** | HTTP `200` with text `OK` | Returns `OK` to CPX Research server |

---

## 🤖 5. Live Telegram Bot & Notification Engine

The bot `@survey_king_bot` automatically communicates with users in real time:

1. **`/start` Command**: Greets user with their live Coin balance, referral link, and a 1-click **Open Survey King App** Mini App button.
2. **🎯 Survey Completion Notification**:
   ```text
   🎉 SURVEY REWARD CREDITED!

   🎯 Survey: CPX Research Survey
   🪙 Reward Earned: +8,200 Coins (≈ ₹82.00 INR)

   💰 Updated Balance: 9,200 Coins (≈ ₹92.00 INR)

   Keep taking surveys to earn more! 🚀
   ```
3. **🎁 Referral Bonus Notification**:
   ```text
   🎁 REFERRAL BONUS CREDITED!

   🎉 Congratulations! Friend completed their first survey!
   🪙 Referral Reward: +1,000 Coins (≈ ₹10.00 INR)

   💰 Updated Balance: 10,200 Coins (≈ ₹102.00 INR)
   ```
4. **✅ Withdrawal Approval Notification**:
   ```text
   ✅ WITHDRAWAL APPROVED & PROCESSED!

   💳 Method: UPI Transfer (VPA)
   💵 Amount: ₹50.00 INR
   📲 Destination: user@paytm

   Your payout has been transferred successfully! Thank you for using Survey King 👑
   ```
5. **❌ Withdrawal Rejection & Auto-Refund Notification**:
   ```text
   ❌ WITHDRAWAL REJECTED & REFUNDED

   💳 Method: UPI
   📲 Destination: user@paytm
   🔄 Refunded Balance: +2,500 Coins (≈ ₹25.00 INR)

   Your coins have been automatically refunded to your balance.
   ```

---

## 🚀 6. Server Infrastructure & Deployment

- **Hosting Platform**: Dokploy on VPS (`72.61.254.236`)
- **Database Engine**: Dedicated MySQL Instance (`surveyking`)
- **Single-Port Architecture**: Port `5000` serves both Express REST APIs and compiled React Frontend static assets.
- **GitHub Repository**: [github.com/SatyaInfoTechNetworks/SurveyKing](https://github.com/SatyaInfoTechNetworks/SurveyKing)

---
*Documentation compiled by Antigravity AI Engine for Satya InfoTech Networks.*

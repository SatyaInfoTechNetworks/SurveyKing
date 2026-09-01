const TelegramBot = require('node-telegram-bot-api');
const db = require('../config/db');
require('dotenv').config();

let bot = null;

function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.WEBAPP_URL || 'https://surveyking.satyainfotechnetworks.com';

  if (!token || token.includes('SampleSurveyKingBotTokenMock')) {
    console.log('ℹ️ Telegram Bot running in mock/demo mode (add real TELEGRAM_BOT_TOKEN to .env to connect to Telegram live).');
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: false });

    // Clear any previous webhook or lingering sessions from previous container deployments
    bot.deleteWebHook({ drop_pending_updates: true })
      .then(() => {
        bot.startPolling({ restart: true, interval: 300 });
        console.log('🤖 Survey King Telegram Bot INITIALIZED & LISTENING LIVE!');
      })
      .catch((err) => {
        console.warn('⚠️ Telegram deleteWebHook notice:', err.message);
        bot.startPolling({ restart: true, interval: 300 });
        console.log('🤖 Survey King Telegram Bot INITIALIZED & LISTENING LIVE!');
      });

    // Graceful error handler to prevent log spam during zero-downtime container rollover
    bot.on('polling_error', (err) => {
      if (err.code === 'ETELEGRAM' && err.message?.includes('409 Conflict')) {
        // Transient conflict while previous container terminates, safely handled by next tick
        return;
      }
      console.warn('⚠️ Telegram Bot Polling Notice:', err.message || err);
    });

    // Handle Telegram /start command
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const tgUserId = String(msg.from.id);
      const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'User';
      const username = msg.from.username || 'user';
      const refCode = match ? match[1] : null;

      console.log(`====================================================`);
      console.log(`🤖 [LIVE TELEGRAM BOT START] Timestamp: ${new Date().toISOString()}`);
      console.log(`👤 User: ${name} (@${username}) | TG ID: ${tgUserId} | Chat ID: ${chatId}`);
      console.log(`🎁 Start Param / Referral Code: ${refCode || 'NONE (Direct Start)'}`);
      console.log(`====================================================`);

      try {
        let users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgUserId]);
        let user;

        if (users.length === 0) {
          let myRefCode = 'SK' + Math.floor(10000 + Math.random() * 90000);
          await db.execute(
            `INSERT INTO users (telegram_user_id, name, username, balance, referral_code, referred_by, status) 
             VALUES (?, ?, ?, 0.00, ?, ?, 'ACTIVE')`,
            [tgUserId, name, username, myRefCode, refCode || null]
          );
          users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgUserId]);
          user = users[0];

          if (refCode && refCode !== myRefCode) {
            const referrers = await db.query('SELECT * FROM users WHERE referral_code = ?', [refCode]);
            if (referrers.length > 0) {
              await db.execute(
                `INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, reward_amount)
                 VALUES (?, ?, ?, 'PENDING', 1000.00)`,
                [referrers[0].id, user.id, refCode]
              );
            }
          }
        } else {
          user = users[0];
        }

        const balCoins = parseFloat(user.balance || 0);
        const balRupees = (balCoins / 100).toFixed(2);

        const welcomeText = `👑 *Welcome to Survey King!*\n\n` +
          `Hello ${name}! 👋\n` +
          `Earn real cash rewards by completing quick, high-paying surveys!\n\n` +
          `🪙 *Your Balance:* ${balCoins.toLocaleString()} Coins (≈ ₹${balRupees} INR)\n` +
          `⚡ *Rate:* 1,000 Coins = ₹10.00 INR\n` +
          `🎁 *Referral Code:* \`${user.referral_code || 'SK1234'}\`\n\n` +
          `Click below to launch the Mini App and start earning now! 👇`;

        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎯 Open Survey King App', web_app: { url: `${webAppUrl}/app` } }
              ],
              [
                { text: '💰 My Balance', callback_data: 'EARNINGS' },
                { text: '👥 Refer Friends', callback_data: 'REFERRAL' }
              ]
            ]
          },
          parse_mode: 'Markdown'
        };

        await bot.sendMessage(chatId, welcomeText, keyboard);
        await recordNotificationLog(tgUserId, 'BOT_WELCOME', welcomeText, 'SENT', null);
      } catch (err) {
        console.error('Bot /start handler error:', err);
        await bot.sendMessage(chatId, '👑 Welcome to Survey King! Click below to start earning.', {
          reply_markup: {
            inline_keyboard: [[{ text: '🎯 Launch App', web_app: { url: `${webAppUrl}/app` } }]]
          }
        });
      }
    });

    // Callback queries
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const tgUserId = String(query.from.id);
      const data = query.data;

      try {
        const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgUserId]);
        const user = users[0];

        if (data === 'EARNINGS') {
          const balCoins = user ? parseFloat(user.balance || 0) : 0;
          const balRupees = (balCoins / 100).toFixed(2);
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, `💰 *Your Current Balance:*\n\n🪙 *${balCoins.toLocaleString()} Coins* (≈ ₹${balRupees} INR)\n\nComplete surveys in the Mini App to withdraw via UPI!`, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🎯 Open App', web_app: { url: `${webAppUrl}/app` } }]]
            }
          });
        } else if (data === 'REFERRAL') {
          const refCode = user ? user.referral_code : 'SK12345';
          const link = `https://t.me/survey_king_bot?start=${refCode}`;
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, `👥 *Refer & Earn 1,000 Coins (₹10.00)!*\n\nYour Referral Code: \`${refCode}\`\nShare Link: ${link}\n\nYou earn 1,000 Coins when your friend completes their first survey of 100+ coins! Your friend gets 500 bonus Coins!`, {
            parse_mode: 'Markdown'
          });
        }
      } catch (err) {
        console.error('Callback query error:', err);
      }
    });

  } catch (err) {
    console.warn('⚠️ Could not start Telegram Bot:', err.message);
  }
}

// ---------------------------------------------------------
// NOTIFICATION SYSTEM FOR USER EVENTS
// ---------------------------------------------------------

async function recordNotificationLog(telegramUserId, type, message, status, errorMessage) {
  try {
    await db.execute(
      `INSERT INTO telegram_notifications (telegram_user_id, type, message, status, error_message)
       VALUES (?, ?, ?, ?, ?)`,
      [String(telegramUserId), type, message, status, errorMessage || null]
    );
  } catch (e) {
    console.warn('Could not record notification log to DB:', e.message);
  }
}

/**
 * Notify user on Telegram when Survey Reward Coins are credited
 */
async function notifySurveyReward(telegramUserId, surveyTitle, rewardCoins, newBalanceCoins) {
  if (!bot || !telegramUserId) return;
  const rupees = (rewardCoins / 100).toFixed(2);
  const newRupees = (newBalanceCoins / 100).toFixed(2);

  const message = `🎉 *SURVEY REWARD CREDITED!*\n\n` +
    `🎯 *Survey:* ${surveyTitle || 'Paid Survey'}\n` +
    `🪙 *Reward Earned:* +${rewardCoins.toLocaleString()} Coins (≈ ₹${rupees} INR)\n\n` +
    `💰 *Updated Balance:* ${newBalanceCoins.toLocaleString()} Coins (≈ ₹${newRupees} INR)\n\n` +
    `Keep taking surveys to earn more! 🚀`;

  try {
    const webAppUrl = process.env.WEBAPP_URL || 'https://surveyking.satyainfotechnetworks.com';
    await bot.sendMessage(telegramUserId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🎯 Take Next Survey', web_app: { url: `${webAppUrl}/app` } }]]
      }
    });
    await recordNotificationLog(telegramUserId, 'SURVEY_REWARD', message, 'SENT', null);
    console.log(`📲 Telegram Notification Sent to User ${telegramUserId} for Survey Reward (+${rewardCoins} Coins)`);
  } catch (err) {
    await recordNotificationLog(telegramUserId, 'SURVEY_REWARD', message, 'FAILED', err.message);
    console.warn(`⚠️ Failed to send survey reward notification to ${telegramUserId}:`, err.message);
  }
}

/**
 * Notify user on Telegram when Referral Bonus Coins are credited
 */
async function notifyReferralReward(telegramUserId, rewardCoins, newBalanceCoins, friendName = 'a friend') {
  if (!bot || !telegramUserId) return;
  const rupees = (rewardCoins / 100).toFixed(2);
  const newRupees = (newBalanceCoins / 100).toFixed(2);

  const message = `🎁 *REFERRAL BONUS CREDITED!*\n\n` +
    `🎉 *Congratulations!* ${friendName} completed their first survey!\n` +
    `🪙 *Referral Reward:* +${rewardCoins.toLocaleString()} Coins (≈ ₹${rupees} INR)\n\n` +
    `💰 *Updated Balance:* ${newBalanceCoins.toLocaleString()} Coins (≈ ₹${newRupees} INR)\n\n` +
    `Invite more friends to earn unlimited bonuses! 🚀`;

  try {
    const webAppUrl = process.env.WEBAPP_URL || 'https://surveyking.satyainfotechnetworks.com';
    await bot.sendMessage(telegramUserId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '👥 Invite More Friends', web_app: { url: `${webAppUrl}/app` } }]]
      }
    });
    await recordNotificationLog(telegramUserId, 'REFERRAL_REWARD', message, 'SENT', null);
    console.log(`📲 Telegram Notification Sent to User ${telegramUserId} for Referral Reward (+${rewardCoins} Coins)`);
  } catch (err) {
    await recordNotificationLog(telegramUserId, 'REFERRAL_REWARD', message, 'FAILED', err.message);
    console.warn(`⚠️ Failed to send referral reward notification to ${telegramUserId}:`, err.message);
  }
}

/**
 * Notify user on Telegram when Survey Reward is Reversed / Chargebacked
 */
async function notifySurveyReversal(telegramUserId, surveyTitle, deductedCoins, newBalanceCoins, reason = 'Survey Partner Reversal') {
  if (!bot || !telegramUserId) return;
  const rupees = (deductedCoins / 100).toFixed(2);
  const newRupees = (newBalanceCoins / 100).toFixed(2);

  const message = `⚠️ *SURVEY REWARD REVERSED*\n\n` +
    `🎯 *Survey:* ${surveyTitle || 'Survey'}\n` +
    `🪙 *Deduction:* -${deductedCoins.toLocaleString()} Coins (≈ ₹${rupees} INR)\n` +
    `ℹ️ *Reason:* ${reason || 'Canceled by Partner'}\n\n` +
    `💰 *Updated Balance:* ${newBalanceCoins.toLocaleString()} Coins (≈ ₹${newRupees} INR)\n\n` +
    `Please answer carefully and attentively to avoid partner quality reversals.`;

  try {
    await bot.sendMessage(telegramUserId, message, { parse_mode: 'Markdown' });
    await recordNotificationLog(telegramUserId, 'SURVEY_REVERSAL', message, 'SENT', null);
    console.log(`📲 Telegram Reversal Alert Sent to User ${telegramUserId} (-${deductedCoins} Coins)`);
  } catch (err) {
    await recordNotificationLog(telegramUserId, 'SURVEY_REVERSAL', message, 'FAILED', err.message);
  }
}

/**
 * Notify user on Telegram when Withdrawal Request is Approved
 */
async function notifyWithdrawalApproved(telegramUserId, amountRupees, upiId, method = 'UPI') {
  if (!bot || !telegramUserId) return;
  const message = `✅ *WITHDRAWAL APPROVED & PROCESSED!*\n\n` +
    `💳 *Method:* ${method}\n` +
    `💵 *Amount:* ₹${parseFloat(amountRupees).toFixed(2)} INR\n` +
    `📲 *Destination:* \`${upiId}\`\n\n` +
    `Your payout has been transferred successfully! Thank you for using Survey King 👑`;

  try {
    await bot.sendMessage(telegramUserId, message, { parse_mode: 'Markdown' });
    await recordNotificationLog(telegramUserId, 'WITHDRAWAL_APPROVED', message, 'SENT', null);
    console.log(`📲 Telegram Notification Sent to User ${telegramUserId} for Approved Withdrawal (₹${amountRupees})`);
  } catch (err) {
    await recordNotificationLog(telegramUserId, 'WITHDRAWAL_APPROVED', message, 'FAILED', err.message);
    console.warn(`⚠️ Failed to send withdrawal approval notification to ${telegramUserId}:`, err.message);
  }
}

/**
 * Notify user on Telegram when Withdrawal Request is Rejected and Refunded
 */
async function notifyWithdrawalRejected(telegramUserId, refundCoins, upiId, method = 'UPI') {
  if (!bot || !telegramUserId) return;
  const refundRupees = (refundCoins / 100).toFixed(2);

  const message = `❌ *WITHDRAWAL REJECTED & REFUNDED*\n\n` +
    `💳 *Method:* ${method}\n` +
    `📲 *Destination:* \`${upiId}\`\n` +
    `🔄 *Refunded Balance:* +${refundCoins.toLocaleString()} Coins (≈ ₹${refundRupees} INR)\n\n` +
    `Your coins have been automatically refunded to your balance. Please check your payment details and request again in the app.`;

  try {
    const webAppUrl = process.env.WEBAPP_URL || 'https://surveyking.satyainfotechnetworks.com';
    await bot.sendMessage(telegramUserId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '💰 Open Balance in App', web_app: { url: `${webAppUrl}/app` } }]]
      }
    });
    await recordNotificationLog(telegramUserId, 'WITHDRAWAL_REJECTED', message, 'SENT', null);
    console.log(`📲 Telegram Notification Sent to User ${telegramUserId} for Rejected Withdrawal Refund (+${refundCoins} Coins)`);
  } catch (err) {
    await recordNotificationLog(telegramUserId, 'WITHDRAWAL_REJECTED', message, 'FAILED', err.message);
    console.warn(`⚠️ Failed to send withdrawal rejection notification to ${telegramUserId}:`, err.message);
  }
}

/**
 * Send broadcast announcement to all users or specific user
 */
async function sendBroadcast(telegramUserId, text) {
  if (!bot) return false;
  try {
    await bot.sendMessage(telegramUserId, text, { parse_mode: 'Markdown' });
    await recordNotificationLog(telegramUserId, 'ADMIN_BROADCAST', text, 'SENT', null);
    return true;
  } catch (err) {
    await recordNotificationLog(telegramUserId, 'ADMIN_BROADCAST', text, 'FAILED', err.message);
    return false;
  }
}

module.exports = {
  initBot,
  notifySurveyReward,
  notifySurveyReversal,
  notifyReferralReward,
  notifyWithdrawalApproved,
  notifyWithdrawalRejected,
  sendBroadcast
};

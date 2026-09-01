const TelegramBot = require('node-telegram-bot-api');
const db = require('../config/db');
require('dotenv').config();

let bot = null;

function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

  if (!token || token.includes('SampleSurveyKingBotTokenMock')) {
    console.log('ℹ️ Telegram Bot running in mock/demo mode (add real TELEGRAM_BOT_TOKEN to .env to connect to Telegram live).');
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('🤖 Survey King Telegram Bot initialized & listening for messages...');

    // /start command
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const tgUserId = String(msg.from.id);
      const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'User';
      const username = msg.from.username || 'user';
      const refCode = match ? match[1] : null;

      try {
        // Register or get user via Auth logic
        let users = await db.query('SELECT * FROM users WHERE telegramUserId = ?', [tgUserId]);
        let user;

        if (users.length === 0) {
          let myRefCode = 'SK' + Math.floor(10000 + Math.random() * 90000);
          await db.execute(
            `INSERT INTO users (telegramUserId, name, username, balance, referralCode, referredBy, status) 
             VALUES (?, ?, ?, 0.00, ?, ?, 'ACTIVE')`,
            [tgUserId, name, username, myRefCode, refCode || null]
          );
          users = await db.query('SELECT * FROM users WHERE telegramUserId = ?', [tgUserId]);
          user = users[0];

          if (refCode && refCode !== myRefCode) {
            const referrers = await db.query('SELECT * FROM users WHERE referralCode = ?', [refCode]);
            if (referrers.length > 0) {
              await db.execute(
                `INSERT INTO referrals (referrerUserId, referredUserId, referralCode, status, rewardAmount)
                 VALUES (?, ?, ?, 'PENDING', 15.00)`,
                [referrers[0].id, user.id, refCode]
              );
            }
          }
        } else {
          user = users[0];
        }

        const welcomeText = `👑 **Welcome to Survey King!**\n\n` +
          `Hello ${name}! 👋\n` +
          `Earn real rewards by completing quick, high-paying surveys.\n\n` +
          `🪙 **Your Balance:** ${parseFloat(user.balance || 0).toLocaleString()} Coins (≈ ₹${((user.balance || 0) / 100).toFixed(2)})\n` +
          `💎 **Rate:** 1,000 Coins = ₹10.00\n` +
          `🎁 **Referral Code:** \`${user.referral_code || user.referralCode}\`\n\n` +
          `Click below to open the Mini App and start earning! 👇`;

        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎯 Take Surveys', web_app: { url: webAppUrl } }
              ],
              [
                { text: '💰 My Earnings', callback_data: 'EARNINGS' },
                { text: '👥 Refer & Earn', callback_data: 'REFERRAL' }
              ],
              [
                { text: '📜 History', callback_data: 'HISTORY' }
              ]
            ]
          },
          parse_mode: 'Markdown'
        };

        await bot.sendMessage(chatId, welcomeText, keyboard);
      } catch (err) {
        console.error('Bot /start error:', err);
        await bot.sendMessage(chatId, '👑 Welcome to Survey King! Click below to start earning.', {
          reply_markup: {
            inline_keyboard: [[{ text: '🎯 Take Surveys', web_app: { url: webAppUrl } }]]
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
        const users = await db.query('SELECT * FROM users WHERE telegramUserId = ?', [tgUserId]);
        const user = users[0];

        if (data === 'EARNINGS') {
          const bal = user ? parseFloat(user.balance || 0).toFixed(2) : '0.00';
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, `💰 **Your Current Balance:** ₹${bal}\n\nComplete surveys in the Mini App to withdraw via UPI!`, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🎯 Open Survey Dashboard', web_app: { url: webAppUrl } }]]
            }
          });
        } else if (data === 'REFERRAL') {
          const refCode = user ? user.referralCode : 'SK12345';
          const link = `https://t.me/survey_king_bot?start=${refCode}`;
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, `👥 **Refer & Earn ₹15 per Friend!**\n\nYour Referral Code: \`${refCode}\`\nShare Link: ${link}\n\nYou earn ₹15 when your friend completes their first survey!`, {
            parse_mode: 'Markdown'
          });
        } else if (data === 'HISTORY') {
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, `📜 Open the Mini App to view your full wallet and transaction history!`, {
            reply_markup: {
              inline_keyboard: [[{ text: '📜 View History in Mini App', web_app: { url: webAppUrl } }]]
            }
          });
        }
      } catch (err) {
        console.error('Callback error:', err);
      }
    });

  } catch (err) {
    console.warn('⚠️ Could not start Telegram Bot:', err.message);
  }
}

module.exports = { initBot };

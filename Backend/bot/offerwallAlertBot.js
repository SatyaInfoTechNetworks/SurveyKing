/**
 * StuEarnIndia Offerwall Alert Bot
 * Sends instant completion & reversal notifications to the administrator
 * Bot Token: 8441190461:AAErfv2dgLp7DiWuo85RmnFL7AS3HwHu1W0
 * Target Admin Chat/User ID: 1981634693
 */

require('dotenv').config();

const ALERT_BOT_TOKEN = process.env.ALERT_BOT_TOKEN || '8441190461:AAErfv2dgLp7DiWuo85RmnFL7AS3HwHu1W0';
const ALERT_CHAT_ID = process.env.ALERT_CHAT_ID || '1981634693';

/**
 * Send an offerwall completion or reversal alert
 * @param {Object} options
 * @param {'COMPLETION'|'REVERSAL'} options.type
 * @param {Object} options.user - { name, username, telegram_user_id, id }
 * @param {string} options.offerName - Title or ID of the completed offer/survey
 * @param {string} options.offerwall - Provider name (e.g. OPINIONUNIVERSE, CPX RESEARCH, TIMEWALL)
 * @param {number} options.coins - Coin amount (positive)
 * @param {string} options.transId - Transaction or Click ID
 * @param {string} [options.imageUrl] - Optional brand or offer image URL
 * @param {string} [options.systemLogTime] - ISO string timestamp
 */
async function sendOfferwallAlert({
  type = 'COMPLETION',
  user = {},
  offerName = 'Survey Task',
  offerwall = 'OFFERWALL',
  coins = 0,
  transId = 'N/A',
  imageUrl = null,
  systemLogTime = new Date().toISOString()
}) {
  if (!ALERT_BOT_TOKEN || !ALERT_CHAT_ID) {
    console.warn('⚠️ [OFFERWALL ALERT] Alert bot token or chat ID is missing.');
    return;
  }

  try {
    const isCompletion = type === 'COMPLETION';
    const headerTitle = isCompletion ? '🔔 Offerwall Completion Alert' : '🔔 Offerwall Reversal Alert';
    
    // User display
    let userHandle = user.username ? `@${user.username}` : (user.name || 'User');
    const uid = user.telegram_user_id || user.id || 'N/A';
    const formattedUser = `${userHandle} (UID: ${uid})`;

    // Coins line
    const coinsDisplay = isCompletion 
      ? `💰 Coins Credited: +${Math.round(coins)} Coins`
      : `🪙 Coins Deducted: -${Math.round(Math.abs(coins))} Coins`;

    // Construct text matching exact StuEarnIndia Alert App template
    let text = `${headerTitle}\n\n` +
      `👤 User: ${formattedUser}\n` +
      `🔥 Offer Name: ${offerName}\n` +
      `📡 Offerwall: ${String(offerwall).toUpperCase()}\n` +
      `${coinsDisplay}\n` +
      `🆔 Transaction ID: ${transId}\n`;

    if (imageUrl) {
      text += `🖼 Offerwall Image: [View Brand Logo](${imageUrl})\n`;
    }

    text += `\n⚡ Powered by SurveyKing\n` +
      `🕒 System Log Time: ${systemLogTime}`;

    const url = `https://api.telegram.org/bot${ALERT_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ALERT_CHAT_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.warn(`⚠️ [OFFERWALL ALERT FAILED]:`, data.description);
    } else {
      console.log(`🚀 [OFFERWALL ALERT SENT] Type: ${type} | User: ${formattedUser} | Coins: ${coins} | Tx: ${transId}`);
    }
  } catch (err) {
    console.error('❌ [OFFERWALL ALERT ERROR]:', err.message);
  }
}

module.exports = {
  sendOfferwallAlert
};

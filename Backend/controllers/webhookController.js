const db = require('../config/db');
const { notifySurveyReward, notifyReferralReward } = require('../bot/telegramBot');

async function handleWebhook(req, res) {
  const startTime = Date.now();
  const provider = (req.params.provider || 'cpx').toLowerCase();

  // Map CPX Research parameters
  const transId = req.query.trans_id || req.body.trans_id || req.query.participationId || req.body.participationId;
  const rawStatus = String(req.query.status || req.body.status || '1');
  const statusParam = (rawStatus === '1' || rawStatus.toUpperCase() === 'COMPLETED') ? 'COMPLETED' : 'CANCELED';
  const tgUserId = req.query.user_id || req.body.user_id;
  const offerId = req.query.offer_id || req.body.offer_id || 'CPX_OFFER';
  const amountLocal = parseFloat(req.query.amount_local || req.body.amount_local || 0);
  const amountUsd = parseFloat(req.query.amount_usd || req.body.amount_usd || 0);
  const hash = req.query.hash || req.body.hash;

  const clientIp = req.clientIp || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '127.0.0.1';

  console.log(`====================================================`);
  console.log(`🎯 [CPX POSTBACK WEBHOOK] Timestamp: ${new Date().toISOString()}`);
  console.log(`📡 Provider: ${provider.toUpperCase()} | Trans ID: ${transId || 'N/A'}`);
  console.log(`👤 User ID: ${tgUserId || 'N/A'} | Status: ${statusParam} (${rawStatus}) | Reward: ${amountLocal} Coins`);
  console.log(`🌐 IP: ${clientIp}`);
  console.log(`====================================================`);

  let idempotencyStatus = 'NEW';
  let errorReason = null;
  let walletCredited = 0;

  try {
    if (!transId && !tgUserId) {
      errorReason = 'Ping or test webhook';
      await logPostback({ provider, transId: 'TEST_PING', tgUserId: '0', offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'PING_OK', errorReason: null, walletCredited: 0, startTime });
      return res.status(200).send('OK');
    }

    let participation = null;
    let user = null;

    // 1. Try finding participation record by trans_id
    if (transId) {
      const participations = await db.query(
        `SELECT * FROM survey_participations WHERE participation_id = ?`,
        [transId]
      );
      if (participations.length > 0) {
        participation = participations[0];
      }
    }

    // 2. If participation record found
    if (participation) {
      // Idempotency check
      if (participation.status === 'COMPLETED') {
        idempotencyStatus = 'DUPLICATE';
        console.log(`⚠️ Participation ${transId} is ALREADY rewarded. Duplicate postback ignored.`);
        await logPostback({ provider, transId, tgUserId: participation.user_id, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'DUPLICATE', errorReason: 'Already rewarded (Duplicate)', walletCredited: 0, startTime });
        return res.send('OK'); // CPX expects HTTP 200 / "OK"
      }

      if (statusParam !== 'COMPLETED') {
        await db.execute(
          `UPDATE survey_participations SET status = ? WHERE id = ?`,
          [statusParam, participation.id]
        );
        await logPostback({ provider, transId, tgUserId: participation.user_id, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'PROCESSED_CANCELED', errorReason: 'Survey Canceled / Screenout', walletCredited: 0, startTime });
        return res.send('OK');
      }

      await db.execute(
        `UPDATE survey_participations SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [participation.id]
      );

      const users = await db.query(`SELECT * FROM users WHERE id = ?`, [participation.user_id]);
      if (users.length > 0) {
        user = users[0];
      }
    // Map or auto-create user for CPX tests or direct surveys
    if (!user && tgUserId) {
      const userRefCode = 'SK' + Math.random().toString(36).substring(2, 7).toUpperCase();
      try {
        await db.execute(
          `INSERT INTO users (telegram_user_id, name, username, balance, referral_code, status)
           VALUES (?, 'CPX Survey User', 'cpx_user', 0.00, ?, 'ACTIVE')`,
          [String(tgUserId), userRefCode]
        );
        const createdUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(tgUserId)]);
        if (createdUsers.length > 0) {
          user = createdUsers[0];
        }
      } catch (insertErr) {
        // If user was created concurrently
        const existingUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(tgUserId)]);
        if (existingUsers.length > 0) user = existingUsers[0];
      }
    }

    if (!user) {
      errorReason = 'User not found in database (Test Webhook)';
      console.log(`ℹ️ CPX Test Postback received for user ID: ${tgUserId || 'N/A'}`);
      await logPostback({ provider, transId, tgUserId, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'TEST_SUCCESS', errorReason: null, walletCredited: 0, startTime });
      return res.status(200).send('OK');
    }

    if (statusParam !== 'COMPLETED') {
      await logPostback({ provider, transId, tgUserId: user.telegram_user_id, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'CANCELED', errorReason: null, walletCredited: 0, startTime });
      return res.send('OK');
    }

    const rewardAmt = amountLocal > 0 ? amountLocal : parseFloat(participation?.reward || 500);
    const oldBalance = parseFloat(user.balance || 0);
    const newBalance = oldBalance + rewardAmt;

    await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, user.id]);

    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'SURVEY_REWARD', ?, ?, ?)`,
      [user.id, rewardAmt, transId || 'CPX_POSTBACK', `CPX Research Survey Reward`]
    );

    walletCredited = 1;
    console.log(`💰 Credited ${rewardAmt.toLocaleString()} Coins to User ${user.name} (ID: ${user.id}). New balance: ${newBalance.toLocaleString()} Coins`);

    // Send Live Telegram Notification for Survey Completion
    notifySurveyReward(user.telegram_user_id, 'CPX Research Survey', rewardAmt, newBalance);

    // Fetch Dynamic Referral Settings from platform_settings table
    const settingsRows = await db.query('SELECT * FROM platform_settings WHERE id = 1');
    const refSettings = settingsRows[0] || { referrer_reward_coins: 1000, referee_reward_coins: 500, referral_trigger: 'FIRST_SURVEY', min_survey_reward_coins: 100 };

    const minSurveyReward = parseFloat(refSettings.min_survey_reward_coins || 100);

    if (refSettings.referral_trigger === 'FIRST_SURVEY' && rewardAmt >= minSurveyReward) {
      const pendingRefs = await db.query(
        `SELECT * FROM referrals WHERE referred_user_id = ? AND status = 'PENDING'`,
        [user.id]
      );

      if (pendingRefs.length > 0) {
        const referral = pendingRefs[0];
        const referrerId = referral.referrer_user_id;
        const referrerReward = parseFloat(refSettings.referrer_reward_coins || 1000);
        const refereeReward = parseFloat(refSettings.referee_reward_coins || 500);

        // Qualify referral
        await db.execute(`UPDATE referrals SET status = 'QUALIFIED', reward_amount = ? WHERE id = ?`, [referrerReward, referral.id]);

        // 1. Credit Referrer User
        const referrers = await db.query(`SELECT * FROM users WHERE id = ?`, [referrerId]);
        if (referrers.length > 0) {
          const referrer = referrers[0];
          const referrerNewBalance = parseFloat(referrer.balance || 0) + referrerReward;

          await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [referrerNewBalance, referrer.id]);

          await db.execute(
            `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
             VALUES (?, 'REFERRAL_REWARD', ?, ?, ?)`,
            [referrer.id, referrerReward, `REF_${referral.id}`, `Referral bonus for inviting ${user.name}`]
          );

          console.log(`👥 Referral Qualified! Credited ${referrerReward.toLocaleString()} Coins to Referrer ${referrer.name} (ID: ${referrer.id})`);

          // Send Telegram Notification to Referrer
          notifyReferralReward(referrer.telegram_user_id, referrerReward, referrerNewBalance, user.name);
        }

        // 2. Credit Referee User if referee bonus is configured > 0
        if (refereeReward > 0) {
          const currentRefBalance = newBalance;
          const updatedUserBalance = currentRefBalance + refereeReward;

          await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [updatedUserBalance, user.id]);

          await db.execute(
            `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
             VALUES (?, 'REFERRAL_WELCOME_BONUS', ?, ?, ?)`,
            [user.id, refereeReward, `REF_WELCOME_${referral.id}`, `Referral Welcome Bonus for joining via invite`]
          );

          console.log(`🎁 Welcome Referral Bonus! Credited ${refereeReward.toLocaleString()} Coins to Referee ${user.name} (ID: ${user.id})`);

          // Send Telegram Notification to Referee User
          notifyReferralReward(user.telegram_user_id, refereeReward, updatedUserBalance, 'Welcome Bonus');
        }
      }
    }

    // Log Successful Postback
    await logPostback({ provider, transId, tgUserId: user.telegram_user_id, offerId, statusParam, rawStatus, amountLocal: rewardAmt, amountUsd, clientIp, idempotencyStatus: 'SUCCESS', errorReason: null, walletCredited: 1, startTime });

    return res.send('OK'); // CPX Research requires "OK" response body
  } catch (err) {
    console.error('Error handling CPX postback webhook:', err);
    await logPostback({ provider, transId, tgUserId, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'ERROR', errorReason: err.message, walletCredited: 0, startTime });
    return res.status(500).send('ERROR');
  }
}

// Helper to record postback audit in database
async function logPostback({ provider, transId, tgUserId, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus, errorReason, walletCredited, startTime }) {
  try {
    const processingTime = Date.now() - startTime;
    await db.execute(
      `INSERT INTO postback_logs (provider, trans_id, user_id, offer_id, status, raw_status, amount_local, amount_usd, hash_valid, idempotency_status, ip, processing_time_ms, error_reason, wallet_credited)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
      [provider || 'CPX', transId || null, tgUserId ? String(tgUserId) : null, offerId || 'CPX_OFFER', statusParam, rawStatus, amountLocal || 0, amountUsd || 0, idempotencyStatus, clientIp, processingTime, errorReason, walletCredited ? 1 : 0]
    );
  } catch (logErr) {
    console.warn('⚠️ Could not log postback event to DB:', logErr.message);
  }
}

module.exports = {
  handleWebhook
};

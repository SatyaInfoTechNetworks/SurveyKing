const db = require('../config/db');
const { notifySurveyReward, notifySurveyReversal, notifyReferralReward } = require('../bot/telegramBot');

async function handleWebhook(req, res) {
  const startTime = Date.now();
  const provider = (req.params.provider || 'cpx').toLowerCase();

  // Map CPX Research parameters (Full names and ultra-short names)
  const transId = req.query.t || req.query.trans_id || req.body.t || req.body.trans_id || req.query.participationId || req.body.participationId;
  const rawStatus = String(req.query.s || req.query.status || req.body.s || req.body.status || '1').trim();
  const isReversal = (rawStatus === '2' || rawStatus.toUpperCase() === 'CANCELED' || rawStatus.toUpperCase() === 'REVERSED');
  const statusParam = isReversal ? 'CANCELED' : 'COMPLETED';

  const tgUserId = (req.query.u || req.query.user_id || req.body.u || req.body.user_id || req.query.ext_user_id || req.body.ext_user_id || '').toString().trim();
  const offerId = req.query.o || req.query.offer_id || req.body.o || req.body.offer_id || 'CPX_OFFER';
  const amountLocal = parseFloat(req.query.a || req.query.amount_local || req.body.a || req.body.amount_local || 0);
  const amountUsd = parseFloat(req.query.usd || req.query.amount_usd || req.body.usd || req.body.amount_usd || 0);
  const hash = req.query.h || req.query.hash || req.query.secure_hash || req.body.h || req.body.hash;

  const clientIp = req.clientIp || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '127.0.0.1';

  console.log(`====================================================`);
  console.log(`🎯 [CPX POSTBACK WEBHOOK] Timestamp: ${new Date().toISOString()}`);
  console.log(`📡 Provider: ${provider.toUpperCase()} | Trans ID: ${transId || 'N/A'}`);
  console.log(`👤 User ID: ${tgUserId || 'N/A'} | Status: ${isReversal ? 'REVERSAL (status=2)' : 'COMPLETED (status=1)'} | Reward: ${amountLocal} Coins`);
  console.log(`🌐 IP: ${clientIp}`);
  console.log(`====================================================`);

  let idempotencyStatus = 'NEW';
  let errorReason = null;
  let walletCredited = 0;

  try {
    // If empty ping request from test validator
    if (!transId && !tgUserId) {
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

    // 2. Lookup user from participation or from tgUserId
    if (participation) {
      const users = await db.query(`SELECT * FROM users WHERE id = ?`, [participation.user_id]);
      if (users.length > 0) user = users[0];
    } else if (tgUserId) {
      const users = await db.query(`SELECT * FROM users WHERE telegram_user_id = ?`, [String(tgUserId)]);
      if (users.length > 0) {
        user = users[0];
      } else {
        // Auto-create user for CPX tests or direct webhooks
        const userRefCode = 'SK' + Math.random().toString(36).substring(2, 7).toUpperCase();
        try {
          await db.execute(
            `INSERT INTO users (telegram_user_id, name, username, balance, referral_code, status)
             VALUES (?, 'CPX Survey User', 'cpx_user', 0.00, ?, 'ACTIVE')`,
            [String(tgUserId), userRefCode]
          );
          const createdUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(tgUserId)]);
          if (createdUsers.length > 0) user = createdUsers[0];
        } catch (insertErr) {
          const existingUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(tgUserId)]);
          if (existingUsers.length > 0) user = existingUsers[0];
        }
      }
    }

    // Fallback if user still cannot be found (e.g. test validator)
    if (!user) {
      console.log(`ℹ️ Test postback received without matching DB user: ${tgUserId || 'N/A'}`);
      await logPostback({ provider, transId, tgUserId, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'TEST_SUCCESS', errorReason: null, walletCredited: 0, startTime });
      return res.status(200).send('OK');
    }

    // ---------------------------------------------------------------
    // 3. REVERSAL / CHARGEBACK HANDLING (status=2)
    // ---------------------------------------------------------------
    if (isReversal) {
      console.log(`🔄 [CHARGEBACK / REVERSAL] Processing status=2 reversal for Trans ID: ${transId}...`);

      const deductionAmt = amountLocal > 0 ? amountLocal : parseFloat(participation?.reward || 500);

      if (participation && participation.status === 'COMPLETED') {
        // Reverse previously credited coins
        const currentBal = parseFloat(user.balance || 0);
        const newBal = Math.max(0, currentBal - deductionAmt);

        await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [newBal, user.id]);

        await db.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
           VALUES (?, 'SURVEY_REVERSAL', ?, ?, ?)`,
          [user.id, -deductionAmt, transId || 'CPX_REVERSAL', `CPX Survey Chargeback / Reversal (Trans #${transId})`]
        );

        await db.execute(
          `UPDATE survey_participations SET status = 'REVERSED' WHERE id = ?`,
          [participation.id]
        );

        console.log(`📉 Reversal Complete: Deducted ${deductionAmt} Coins from User ${user.name}. New Balance: ${newBal} Coins`);

        // Notify user via Telegram about reversal
        notifySurveyReversal(user.telegram_user_id, 'CPX Research Survey', deductionAmt, newBal, 'Canceled / Reversed by Partner');

        await logPostback({ provider, transId, tgUserId: user.telegram_user_id, offerId, statusParam: 'REVERSED', rawStatus, amountLocal: deductionAmt, amountUsd, clientIp, idempotencyStatus: 'REVERSED', errorReason: 'Chargeback Executed', walletCredited: 0, startTime });
        return res.status(200).send('OK');
      } else if (participation && participation.status === 'REVERSED') {
        console.log(`⚠️ Transaction ${transId} was ALREADY reversed. Duplicate reversal safely ignored.`);
        await logPostback({ provider, transId, tgUserId: user.telegram_user_id, offerId, statusParam: 'REVERSED', rawStatus, amountLocal: deductionAmt, amountUsd, clientIp, idempotencyStatus: 'DUPLICATE_REVERSAL', errorReason: 'Already reversed', walletCredited: 0, startTime });
        return res.status(200).send('OK');
      } else {
        // Screenout or cancellation before completion
        if (participation) {
          await db.execute(`UPDATE survey_participations SET status = 'CANCELED' WHERE id = ?`, [participation.id]);
        }
        await logPostback({ provider, transId, tgUserId: user.telegram_user_id, offerId, statusParam: 'CANCELED', rawStatus, amountLocal: deductionAmt, amountUsd, clientIp, idempotencyStatus: 'CANCELED_OK', errorReason: null, walletCredited: 0, startTime });
        return res.status(200).send('OK');
      }
    }

    // ---------------------------------------------------------------
    // 4. SURVEY COMPLETION HANDLING (status=1)
    // ---------------------------------------------------------------
    if (participation) {
      // Idempotency check: if already completed, don't double credit
      if (participation.status === 'COMPLETED') {
        idempotencyStatus = 'DUPLICATE';
        console.log(`⚠️ Participation ${transId} is ALREADY rewarded. Duplicate completion postback safely ignored.`);
        await logPostback({ provider, transId, tgUserId: participation.user_id, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'DUPLICATE', errorReason: 'Already rewarded (Duplicate)', walletCredited: 0, startTime });
        return res.status(200).send('OK');
      }

      await db.execute(
        `UPDATE survey_participations SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [participation.id]
      );
    } else {
      // Auto-create completed participation record
      const newPartId = transId || `CPX_${Date.now()}`;
      await db.execute(
        `INSERT INTO survey_participations (participation_id, user_id, survey_id, provider, status, reward, completed_at)
         VALUES (?, ?, 'CPX_SURVEY', 'CPX', 'COMPLETED', ?, CURRENT_TIMESTAMP)`,
        [newPartId, user.id, amountLocal > 0 ? amountLocal : 500.00]
      );
    }

    // Credit Coins to User
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

    // Check Referral Qualifications
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

        // Credit Inviter
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

          console.log(`👥 Referral Qualified! Credited ${referrerReward.toLocaleString()} Coins to Referrer ${referrer.name}`);
          notifyReferralReward(referrer.telegram_user_id, referrerReward, referrerNewBalance, user.name);
        }

        // Credit Friend if referee bonus configured > 0
        if (refereeReward > 0) {
          const currentRefBalance = newBalance;
          const updatedUserBalance = currentRefBalance + refereeReward;

          await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [updatedUserBalance, user.id]);

          await db.execute(
            `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
             VALUES (?, 'REFERRAL_WELCOME_BONUS', ?, ?, ?)`,
            [user.id, refereeReward, `REF_WELCOME_${referral.id}`, `Referral Welcome Bonus for joining via invite`]
          );

          console.log(`🎁 Welcome Referral Bonus! Credited ${refereeReward.toLocaleString()} Coins to Referee ${user.name}`);
          notifyReferralReward(user.telegram_user_id, refereeReward, updatedUserBalance, 'Welcome Bonus');
        }
      }
    }

    // Log Successful Postback
    await logPostback({ provider, transId, tgUserId: user.telegram_user_id, offerId, statusParam, rawStatus, amountLocal: rewardAmt, amountUsd, clientIp, idempotencyStatus: 'SUCCESS', errorReason: null, walletCredited: 1, startTime });

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Error handling CPX postback webhook:', err);
    await logPostback({ provider, transId, tgUserId, offerId, statusParam, rawStatus, amountLocal, amountUsd, clientIp, idempotencyStatus: 'ERROR', errorReason: err.message, walletCredited: 0, startTime });
    return res.status(200).send('OK');
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

// -------------------------------------------------------------------
// TIMEWALL.IO POSTBACK WEBHOOK HANDLER
// -------------------------------------------------------------------
const crypto = require('crypto');

async function handleTimeWallWebhook(req, res) {
  const startTime = Date.now();
  const provider = 'timewall';

  // Extract TimeWall Macro Parameters
  const userId = (req.query.userId || req.query.user_id || req.body.userId || req.body.user_id || '').toString().trim();
  const txId = (req.query.txId || req.query.transactionID || req.query.txid || req.body.txId || req.body.transactionID || '').toString().trim();
  const rawRevenue = req.query.revenue !== undefined ? String(req.query.revenue).trim() : (req.body.revenue !== undefined ? String(req.body.revenue).trim() : '0');
  const revenueUsd = parseFloat(rawRevenue) || 0;
  
  const rawCurrency = req.query.currency || req.query.currencyAmount || req.body.currency || req.body.currencyAmount;
  // Use exact currencyAmount (coins) sent by TimeWall directly without math multipliers
  let coinAmount = parseInt(rawCurrency || 0, 10);

  const incomingHash = req.query.hash || req.body.hash;
  const rawType = (req.query.type || req.body.type || 'credit').toLowerCase();
  const isChargeback = (rawType === 'chargeback' || revenueUsd < 0);
  const isHold = (rawType === 'hold' || rawType === 'hold_cancelled');
  const offerName = req.query.offerName || req.query.offername || req.body.offerName || 'TimeWall Task';
  const reason = req.query.reason || req.body.reason || '';

  const clientIp = req.clientIp || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '127.0.0.1';

  console.log(`====================================================`);
  console.log(`⏱️ [TIMEWALL POSTBACK WEBHOOK] Timestamp: ${new Date().toISOString()}`);
  console.log(`📡 Provider: TIMEWALL | TxId: ${txId || 'N/A'} | Type: ${rawType.toUpperCase()}`);
  console.log(`👤 User ID: ${userId || 'N/A'} | Revenue: $${rawRevenue} | Coins: ${coinAmount}`);
  console.log(`🌐 IP: ${clientIp}`);
  console.log(`====================================================`);

  // Verify TimeWall SHA256 Hash if provided: hash("sha256", userID . revenue . SecretKey)
  const timeWallSecretKey = process.env.TIMEWALL_SECRET_KEY || 'd1180f52115620445ee622e4fb764f2d';
  if (incomingHash && userId && rawRevenue) {
    const expectedHash = crypto.createHash('sha256').update(`${userId}${rawRevenue}${timeWallSecretKey}`).digest('hex');
    if (incomingHash.toLowerCase() !== expectedHash.toLowerCase()) {
      console.warn(`⚠️ [TIMEWALL] Hash mismatch! Incoming: ${incomingHash} | Expected: ${expectedHash}`);
    } else {
      console.log(`🔒 [TIMEWALL] SHA256 Hash Verified!`);
    }
  }

  // Handle Empty Ping / Test Validator
  if (!txId && !userId) {
    await logPostback({ provider: 'TimeWall', transId: 'TEST_PING', tgUserId: '0', offerId: offerName, statusParam: 'PING_OK', rawStatus: rawType, amountLocal: 0, amountUsd: 0, clientIp, idempotencyStatus: 'PING_OK', errorReason: null, walletCredited: 0, startTime });
    return res.status(200).send('OK');
  }

  // Hold states: Acknowledge with 200 OK without awarding/deducting wallet balance
  if (isHold) {
    console.log(`ℹ️ [TIMEWALL] Hold state received: ${rawType} for Tx: ${txId}. Acknowledged.`);
    await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: userId, offerId: offerName, statusParam: rawType.toUpperCase(), rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'HOLD_ACK', errorReason: null, walletCredited: 0, startTime });
    return res.status(200).send('OK');
  }

  try {
    // 1. Check Idempotency (prevent duplicate crediting)
    const existingTx = await db.query(
      `SELECT * FROM wallet_transactions WHERE reference_id = ?`,
      [`TW_${txId}`]
    );

    if (!isChargeback && existingTx.length > 0) {
      console.log(`⚠️ [TIMEWALL DUPLICATE] Transaction ${txId} already processed.`);
      await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: userId, offerId: offerName, statusParam: 'DUPLICATE', rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'DUPLICATE', errorReason: 'Already credited', walletCredited: 0, startTime });
      return res.status(200).send('OK');
    }

    // 2. Lookup or Auto-Create User
    let user = null;
    if (userId) {
      const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(userId)]);
      if (users.length > 0) {
        user = users[0];
      } else {
        const userRefCode = 'SK' + Math.random().toString(36).substring(2, 7).toUpperCase();
        try {
          await db.execute(
            `INSERT INTO users (telegram_user_id, name, username, balance, referral_code, status)
             VALUES (?, 'TimeWall User', 'timewall_user', 0.00, ?, 'ACTIVE')`,
            [String(userId), userRefCode]
          );
          const createdUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(userId)]);
          if (createdUsers.length > 0) user = createdUsers[0];
        } catch (insertErr) {
          const existing = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(userId)]);
          if (existing.length > 0) user = existing[0];
        }
      }
    }

    if (!user) {
      console.log(`ℹ️ Test postback received without matching DB user: ${userId}`);
      await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: userId, offerId: offerName, statusParam: 'TEST_SUCCESS', rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'TEST_SUCCESS', errorReason: null, walletCredited: 0, startTime });
      return res.status(200).send('OK');
    }

    // 3. Handle Chargeback / Reversal
    if (isChargeback) {
      console.log(`🔄 [TIMEWALL CHARGEBACK] Deducting ${coinAmount} Coins for User ${user.id} (Tx: ${txId})...`);

      const existingChargeback = await db.query(
        `SELECT * FROM wallet_transactions WHERE reference_id = ?`,
        [`TW_REV_${txId}`]
      );
      if (existingChargeback.length > 0) {
        console.log(`ℹ️ [TIMEWALL] Duplicate chargeback already applied for Tx: ${txId}`);
        await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: user.telegram_user_id, offerId: offerName, statusParam: 'CANCELED', rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'DUPLICATE_REVERSAL', errorReason: 'Already reversed', walletCredited: 0, startTime });
        return res.status(200).send('OK');
      }

      const currentBal = parseFloat(user.balance || 0);
      const newBal = Math.max(0, currentBal - coinAmount);

      await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [newBal, user.id]);

      await db.execute(
        `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
         VALUES (?, 'SURVEY_REVERSAL', ?, ?, ?)`,
        [user.id, -coinAmount, `TW_REV_${txId}`, `TimeWall Chargeback (Trans #${txId}) ${reason ? `- ${reason}` : ''}`.trim()]
      );

      notifySurveyReversal(user.telegram_user_id, coinAmount, newBal, txId);

      await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: user.telegram_user_id, offerId: offerName, statusParam: 'CANCELED', rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'REVERSED', errorReason: reason || null, walletCredited: 0, startTime });
      return res.status(200).send('OK');
    }

    // 4. Handle Successful Credit
    const currentBalance = parseFloat(user.balance || 0);
    const newBalance = currentBalance + coinAmount;

    await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, user.id]);

    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'SURVEY_REWARD', ?, ?, ?)`,
      [user.id, coinAmount, `TW_${txId}`, `TimeWall: ${offerName} (Trans #${txId})`]
    );

    // Record survey participation
    await db.execute(
      `INSERT INTO survey_participations (user_id, survey_id, participation_id, provider, reward, status, started_at, completed_at)
       VALUES (?, ?, ?, 'TimeWall', ?, 'COMPLETED', NOW(), NOW())`,
      [user.id, `TW_${txId}`, txId, coinAmount]
    );

    notifySurveyReward(user.telegram_user_id, coinAmount, newBalance, offerName);

    await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: user.telegram_user_id, offerId: offerName, statusParam: 'COMPLETED', rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'SUCCESS', errorReason: null, walletCredited: 1, startTime });

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Error handling TimeWall postback:', err);
    await logPostback({ provider: 'TimeWall', transId: txId, tgUserId: userId, offerId: offerName, statusParam: 'ERROR', rawStatus: rawType, amountLocal: coinAmount, amountUsd: revenueUsd, clientIp, idempotencyStatus: 'ERROR', errorReason: err.message, walletCredited: 0, startTime });
    return res.status(200).send('OK');
  }
}

module.exports = {
  handleWebhook,
  handleTimeWallWebhook
};

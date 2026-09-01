const db = require('../config/db');
const { notifySurveyReward, notifyReferralReward } = require('../bot/telegramBot');

async function handleWebhook(req, res) {
  try {
    const provider = req.params.provider || 'cpx';
    const participationId = req.body.participationId || req.query.participationId;
    const statusParam = (req.body.status || req.query.status || 'COMPLETED').toUpperCase();

    const clientIp = req.clientIp || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '127.0.0.1';

    console.log(`====================================================`);
    console.log(`🎯 [SURVEY WEBHOOK EVENT] Timestamp: ${new Date().toISOString()}`);
    console.log(`📡 Provider: ${provider.toUpperCase()} | Participation ID: ${participationId || 'N/A'}`);
    console.log(`📊 Status: ${statusParam} | IP: ${clientIp}`);
    console.log(`====================================================`);

    if (!participationId) {
      return res.status(400).json({ error: 'participationId is required in webhook payload' });
    }

    const participations = await db.query(
      `SELECT * FROM survey_participations WHERE participation_id = ?`,
      [participationId]
    );

    if (participations.length === 0) {
      return res.status(404).json({ error: 'Participation record not found' });
    }

    const participation = participations[0];

    // IDEMPOTENCY CHECK - Prevent Double Rewards!
    if (participation.status === 'COMPLETED') {
      console.log(`⚠️ Participation ${participationId} is ALREADY rewarded. Ignoring request to prevent double payout.`);
      return res.json({
        success: true,
        status: 'IGNORED',
        message: 'Survey participation has already been completed and rewarded.'
      });
    }

    if (statusParam !== 'COMPLETED') {
      await db.execute(
        `UPDATE survey_participations SET status = ? WHERE id = ?`,
        [statusParam, participation.id]
      );
      return res.json({ success: true, status: statusParam, message: 'Participation marked as ' + statusParam });
    }

    // Mark COMPLETED
    await db.execute(
      `UPDATE survey_participations SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [participation.id]
    );

    const users = await db.query(`SELECT * FROM users WHERE id = ?`, [participation.user_id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Associated user not found' });
    }

    const user = users[0];
    const rewardAmt = parseFloat(participation.reward);

    const oldBalance = parseFloat(user.balance || 0);
    const newBalance = oldBalance + rewardAmt;

    await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, user.id]);

    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'SURVEY_REWARD', ?, ?, ?)`,
      [user.id, rewardAmt, participationId, `Survey Reward (${participation.survey_id})`]
    );

    console.log(`💰 Credited ${rewardAmt.toLocaleString()} Coins to User ${user.name} (ID: ${user.id}). New balance: ${newBalance.toLocaleString()} Coins`);

    // Send Live Telegram Notification for Survey Completion
    notifySurveyReward(user.telegram_user_id, participation.survey_id, rewardAmt, newBalance);

    // Fetch Dynamic Referral Settings from platform_settings table
    const settingsRows = await db.query('SELECT * FROM platform_settings WHERE id = 1');
    const refSettings = settingsRows[0] || { referrer_reward_coins: 1000, referee_reward_coins: 500, referral_trigger: 'FIRST_SURVEY', min_survey_reward_coins: 100 };

    const minSurveyReward = parseFloat(refSettings.min_survey_reward_coins || 100);
    let referralBonusCredited = false;
    let refereeBonusCredited = false;

    if (refSettings.referral_trigger === 'FIRST_SURVEY') {
      if (rewardAmt >= minSurveyReward) {
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
            referralBonusCredited = true;

            // Send Telegram Notification to Referrer
            notifyReferralReward(referrer.telegram_user_id, referrerReward, referrerNewBalance, user.name);
          }

          // 2. Credit Referee User if referee bonus is configured > 0
          if (refereeReward > 0) {
            const currentRefBalance = parseFloat(user.balance || 0) + rewardAmt; // Balance after survey reward
            const updatedUserBalance = currentRefBalance + refereeReward;

            await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [updatedUserBalance, user.id]);

            await db.execute(
              `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
               VALUES (?, 'REFERRAL_WELCOME_BONUS', ?, ?, ?)`,
              [user.id, refereeReward, `REF_WELCOME_${referral.id}`, `Referral Welcome Bonus for joining via invite`]
            );

            console.log(`🎁 Welcome Referral Bonus! Credited ${refereeReward.toLocaleString()} Coins to Referee ${user.name} (ID: ${user.id})`);
            refereeBonusCredited = true;

            // Send Telegram Notification to Referee User
            notifyReferralReward(user.telegram_user_id, refereeReward, updatedUserBalance, 'Welcome Bonus');
          }
        }
      } else {
        console.log(`ℹ️ Survey reward (${rewardAmt} Coins) is below minimum threshold (${minSurveyReward} Coins). Referral qualification skipped.`);
      }
    }

    return res.json({
      success: true,
      status: 'COMPLETED',
      participationId,
      userRewarded: {
        userId: user.id,
        rewardAmount: rewardAmt,
        previousBalance: oldBalance,
        newBalance: newBalance + (refereeBonusCredited ? parseFloat(refSettings.referee_reward_coins || 500) : 0)
      },
      referralBonusCredited,
      refereeBonusCredited
    });
  } catch (err) {
    console.error('Error in handleWebhook:', err);
    return res.status(500).json({ error: 'Failed to process provider webhook', details: err.message });
  }
}

module.exports = {
  handleWebhook
};

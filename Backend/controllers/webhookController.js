const db = require('../config/db');

async function handleWebhook(req, res) {
  try {
    const provider = req.params.provider || 'cpx';
    const participationId = req.body.participationId || req.query.participationId;
    const statusParam = (req.body.status || req.query.status || 'COMPLETED').toUpperCase();

    console.log(`📡 Webhook received from provider [${provider}] for participationId: ${participationId}, status: ${statusParam}`);

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

    console.log(`💰 Credited ₹${rewardAmt.toFixed(2)} to User ${user.name} (ID: ${user.id}). New balance: ₹${newBalance.toFixed(2)}`);

    // Check for Qualifying Referral Reward
    let referralBonusCredited = false;
    const pendingRefs = await db.query(
      `SELECT * FROM referrals WHERE referred_user_id = ? AND status = 'PENDING'`,
      [user.id]
    );

    if (pendingRefs.length > 0) {
      const referral = pendingRefs[0];
      const referrerId = referral.referrer_user_id;
      const refReward = parseFloat(referral.reward_amount || 15.00);

      await db.execute(`UPDATE referrals SET status = 'QUALIFIED' WHERE id = ?`, [referral.id]);

      const referrers = await db.query(`SELECT * FROM users WHERE id = ?`, [referrerId]);
      if (referrers.length > 0) {
        const referrer = referrers[0];
        const referrerNewBalance = parseFloat(referrer.balance || 0) + refReward;

        await db.execute(`UPDATE users SET balance = ? WHERE id = ?`, [referrerNewBalance, referrer.id]);

        await db.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
           VALUES (?, 'REFERRAL_REWARD', ?, ?, ?)`,
          [referrer.id, refReward, `REF_${referral.id}`, `Referral bonus for inviting ${user.name}`]
        );

        console.log(`👥 Referral Qualified! Credited ₹${refReward.toFixed(2)} to Referrer ${referrer.name} (ID: ${referrer.id})`);
        referralBonusCredited = true;
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
        newBalance
      },
      referralBonusCredited
    });
  } catch (err) {
    console.error('Error in handleWebhook:', err);
    return res.status(500).json({ error: 'Failed to process provider webhook', details: err.message });
  }
}

module.exports = {
  handleWebhook
};

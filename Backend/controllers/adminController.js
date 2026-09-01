const db = require('../config/db');

// GET /api/admin/stats
async function getStats(req, res) {
  try {
    const totalUsersRows = await db.query('SELECT COUNT(*) as cnt FROM users');
    const bannedUsersRows = await db.query("SELECT COUNT(*) as cnt FROM users WHERE status = 'BANNED'");
    const totalSurveysRows = await db.query("SELECT COUNT(*) as cnt FROM survey_participations WHERE status = 'COMPLETED'");
    
    const pendingWithdrawalsRows = await db.query("SELECT COUNT(*) as cnt, SUM(amount) as sumCoins FROM withdrawals WHERE status = 'PENDING'");
    const approvedWithdrawalsRows = await db.query("SELECT COUNT(*) as cnt, SUM(amount) as sumCoins FROM withdrawals WHERE status = 'APPROVED'");
    const totalCoinsDistributedRows = await db.query("SELECT SUM(amount) as sumCoins FROM wallet_transactions WHERE amount > 0");

    const totalUsers = totalUsersRows[0]?.cnt || 0;
    const bannedUsers = bannedUsersRows[0]?.cnt || 0;
    const completedSurveys = totalSurveysRows[0]?.cnt || 0;
    const pendingCount = pendingWithdrawalsRows[0]?.cnt || 0;
    const pendingCoins = parseFloat(pendingWithdrawalsRows[0]?.sumCoins || 0);
    const approvedCoins = parseFloat(approvedWithdrawalsRows[0]?.sumCoins || 0);
    const totalCoinsIssued = parseFloat(totalCoinsDistributedRows[0]?.sumCoins || 0);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        bannedUsers,
        completedSurveys,
        pendingWithdrawalsCount: pendingCount,
        pendingWithdrawalsCoins: pendingCoins,
        pendingWithdrawalsRupees: (pendingCoins / 100).toFixed(2),
        totalCoinsIssued,
        totalCoinsIssuedRupees: (totalCoinsIssued / 100).toFixed(2),
        totalPaidOutCoins: approvedCoins,
        totalPaidOutRupees: (approvedCoins / 100).toFixed(2)
      }
    });
  } catch (err) {
    console.error('Error in admin getStats:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats', details: err.message });
  }
}

// GET /api/admin/users
async function getUsers(req, res) {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const status = req.query.status || 'ALL';

    let sql = `
      SELECT u.*, 
        (SELECT COUNT(*) FROM survey_participations WHERE user_id = u.id AND status = 'COMPLETED') as completedSurveysCount,
        (SELECT COUNT(*) FROM referrals WHERE referrer_user_id = u.id) as totalReferralsCount
      FROM users u
      WHERE (u.name LIKE ? OR u.username LIKE ? OR u.telegram_user_id LIKE ? OR u.referral_code LIKE ?)
    `;
    const params = [search, search, search, search];

    if (status !== 'ALL') {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY u.id DESC LIMIT 100`;

    const users = await db.query(sql, params);

    const formatted = users.map(u => ({
      id: u.id,
      telegramUserId: u.telegram_user_id,
      name: u.name,
      username: u.username,
      balance: parseFloat(u.balance || 0),
      balanceRupees: (parseFloat(u.balance || 0) / 100).toFixed(2),
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      status: u.status,
      completedSurveysCount: u.completedSurveysCount || 0,
      totalReferralsCount: u.totalReferralsCount || 0,
      createdAt: u.created_at
    }));

    return res.json({ success: true, users: formatted });
  } catch (err) {
    console.error('Error in admin getUsers:', err);
    return res.status(500).json({ error: 'Failed to fetch users list' });
  }
}

// POST /api/admin/users/:id/status (Ban or Unban)
async function updateUserStatus(req, res) {
  try {
    const userId = req.params.id;
    const { status } = req.body; // 'ACTIVE' or 'BANNED'

    if (!['ACTIVE', 'BANNED'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'ACTIVE' or 'BANNED'" });
    }

    await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    console.log(`🔨 Admin updated User ID ${userId} status to ${status}`);

    return res.json({
      success: true,
      message: `User status successfully updated to ${status}`
    });
  } catch (err) {
    console.error('Error in updateUserStatus:', err);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
}

// POST /api/admin/users/:id/balance
async function updateUserBalance(req, res) {
  try {
    const userId = req.params.id;
    const { amount, description } = req.body;

    const coinAmt = parseFloat(amount);
    if (isNaN(coinAmt)) {
      return res.status(400).json({ error: 'Valid coin amount is required' });
    }

    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const newBalance = parseFloat(user.balance || 0) + coinAmt;

    await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'ADMIN_ADJUSTMENT', ?, 'ADMIN', ?)`,
      [user.id, coinAmt, description || 'Admin Balance Adjustment']
    );

    return res.json({
      success: true,
      message: `Balance updated. New Balance: ${newBalance.toLocaleString()} Coins`,
      newBalance
    });
  } catch (err) {
    console.error('Error in updateUserBalance:', err);
    return res.status(500).json({ error: 'Failed to adjust balance' });
  }
}

// GET /api/admin/withdrawals
async function getWithdrawals(req, res) {
  try {
    const status = req.query.status || 'ALL';

    let sql = `
      SELECT w.*, u.name as userName, u.username as userUsername, u.telegram_user_id as userTgId, u.balance as currentBalance
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `;
    const params = [];

    if (status !== 'ALL') {
      sql += ` WHERE w.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY w.id DESC LIMIT 100`;

    const rows = await db.query(sql, params);

    const formatted = rows.map(w => ({
      id: w.id,
      userId: w.user_id,
      userName: w.userName,
      userUsername: w.userUsername,
      userTgId: w.userTgId,
      currentBalance: parseFloat(w.currentBalance || 0),
      amountCoins: parseFloat(w.amount),
      rupeeValue: (parseFloat(w.amount) / 100).toFixed(2),
      upiId: w.upi_id,
      status: w.status,
      createdAt: w.created_at
    }));

    return res.json({ success: true, withdrawals: formatted });
  } catch (err) {
    console.error('Error in admin getWithdrawals:', err);
    return res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
}

// POST /api/admin/withdrawals/:id/action (Approve or Reject with Coin Refund)
async function processWithdrawal(req, res) {
  try {
    const withdrawalId = req.params.id;
    const { action, note } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'APPROVE' or 'REJECT'" });
    }

    const rows = await db.query('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    const withdrawal = rows[0];

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ error: `Withdrawal is already ${withdrawal.status}` });
    }

    if (action === 'APPROVE') {
      await db.execute("UPDATE withdrawals SET status = 'APPROVED' WHERE id = ?", [withdrawalId]);
      console.log(`✅ Approved Withdrawal ID ${withdrawalId} for ₹${(withdrawal.amount / 100).toFixed(2)} to ${withdrawal.upi_id}`);

      return res.json({
        success: true,
        message: `Withdrawal ID ${withdrawalId} APPROVED successfully! Payout of ₹${(withdrawal.amount / 100).toFixed(2)} marked as sent.`
      });
    } else {
      // REJECT & REFUND COINS TO USER WALLET!
      await db.execute("UPDATE withdrawals SET status = 'REJECTED' WHERE id = ?", [withdrawalId]);

      const users = await db.query('SELECT * FROM users WHERE id = ?', [withdrawal.user_id]);
      if (users.length > 0) {
        const user = users[0];
        const refundAmt = parseFloat(withdrawal.amount);
        const newBalance = parseFloat(user.balance || 0) + refundAmt;

        await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

        await db.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
           VALUES (?, 'WITHDRAWAL_REFUND', ?, ?, ?)`,
          [user.id, refundAmt, `REFUND_${withdrawalId}`, note || `Refund for rejected withdrawal #${withdrawalId}`]
        );
      }

      console.log(`❌ Rejected Withdrawal ID ${withdrawalId} and refunded ${withdrawal.amount} Coins back to user wallet.`);

      return res.json({
        success: true,
        message: `Withdrawal ID ${withdrawalId} REJECTED and ${withdrawal.amount.toLocaleString()} Coins refunded back to user wallet.`
      });
    }
  } catch (err) {
    console.error('Error in processWithdrawal:', err);
    return res.status(500).json({ error: 'Failed to process withdrawal request' });
  }
}

// POST /api/admin/surveys (Create New Survey)
async function createSurvey(req, res) {
  try {
    const { title, reward, estimatedMinutes, provider, category, icon } = req.body;

    if (!title || !reward || !estimatedMinutes) {
      return res.status(400).json({ error: 'title, reward (coins), and estimatedMinutes are required' });
    }

    const surveyId = 'S' + Math.floor(100 + Math.random() * 900);
    const coinReward = parseFloat(reward);

    await db.execute(
      `INSERT INTO surveys (survey_id, title, reward, estimated_minutes, provider, category, icon, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [surveyId, title, coinReward, parseInt(estimatedMinutes, 10), provider || 'CPX', category || 'General', icon || '🎯']
    );

    return res.json({
      success: true,
      message: `Survey '${title}' created successfully with ${coinReward.toLocaleString()} Coins reward!`,
      surveyId
    });
  } catch (err) {
    console.error('Error in createSurvey:', err);
    return res.status(500).json({ error: 'Failed to create survey' });
  }
}

// PUT /api/admin/surveys/:id (Update Survey)
async function updateSurvey(req, res) {
  try {
    const id = req.params.id;
    const { active, reward, title, estimatedMinutes } = req.body;

    const surveys = await db.query('SELECT * FROM surveys WHERE id = ? OR survey_id = ?', [id, id]);
    if (surveys.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const s = surveys[0];

    await db.execute(
      `UPDATE surveys SET active = ?, reward = ?, title = ?, estimated_minutes = ? WHERE id = ?`,
      [
        active !== undefined ? (active ? 1 : 0) : s.active,
        reward !== undefined ? parseFloat(reward) : s.reward,
        title || s.title,
        estimatedMinutes || s.estimated_minutes,
        s.id
      ]
    );

    return res.json({ success: true, message: 'Survey updated successfully' });
  } catch (err) {
    console.error('Error in updateSurvey:', err);
    return res.status(500).json({ error: 'Failed to update survey' });
  }
}

// DELETE /api/admin/surveys/:id
async function deleteSurvey(req, res) {
  try {
    const id = req.params.id;
    await db.execute('DELETE FROM surveys WHERE id = ? OR survey_id = ?', [id, id]);
    return res.json({ success: true, message: 'Survey deleted successfully' });
  } catch (err) {
    console.error('Error in deleteSurvey:', err);
    return res.status(500).json({ error: 'Failed to delete survey' });
  }
}

// GET /api/admin/referral-settings
async function getReferralSettings(req, res) {
  try {
    const rows = await db.query('SELECT * FROM platform_settings WHERE id = 1');
    const settings = rows[0] || { referrer_reward_coins: 1000, referee_reward_coins: 500, referral_trigger: 'FIRST_SURVEY', min_survey_reward_coins: 100 };
    return res.json({
      success: true,
      settings: {
        referrerRewardCoins: settings.referrer_reward_coins,
        refereeRewardCoins: settings.referee_reward_coins,
        referralTrigger: settings.referral_trigger,
        minSurveyRewardCoins: settings.min_survey_reward_coins
      }
    });
  } catch (err) {
    console.error('Error in getReferralSettings:', err);
    return res.status(500).json({ error: 'Failed to fetch referral settings' });
  }
}

// PUT /api/admin/referral-settings
async function updateReferralSettings(req, res) {
  try {
    const { referrerRewardCoins, refereeRewardCoins, referralTrigger, minSurveyRewardCoins } = req.body;

    await db.execute(
      `UPDATE platform_settings SET referrer_reward_coins = ?, referee_reward_coins = ?, referral_trigger = ?, min_survey_reward_coins = ? WHERE id = 1`,
      [parseInt(referrerRewardCoins || 1000, 10), parseInt(refereeRewardCoins || 500, 10), referralTrigger || 'FIRST_SURVEY', parseInt(minSurveyRewardCoins || 100, 10)]
    );

    return res.json({
      success: true,
      message: 'Referral rules updated successfully!'
    });
  } catch (err) {
    console.error('Error in updateReferralSettings:', err);
    return res.status(500).json({ error: 'Failed to update referral settings' });
  }
}

// GET /api/admin/payout-methods
async function getPayoutMethods(req, res) {
  try {
    const rows = await db.query('SELECT * FROM payout_methods ORDER BY id ASC');
    const formatted = rows.map(m => ({
      id: m.id,
      methodId: m.method_id,
      name: m.name,
      icon: m.icon,
      placeholder: m.placeholder,
      tiers: JSON.parse(m.tiers_json || '[]'),
      active: Boolean(m.active)
    }));

    return res.json({ success: true, payoutMethods: formatted });
  } catch (err) {
    console.error('Error in getPayoutMethods:', err);
    return res.status(500).json({ error: 'Failed to fetch payout methods' });
  }
}

// POST /api/admin/payout-methods
async function createPayoutMethod(req, res) {
  try {
    const { methodId, name, icon, placeholder, tiers } = req.body;

    if (!methodId || !name) {
      return res.status(400).json({ error: 'methodId and name are required' });
    }

    const tiersJson = JSON.stringify(tiers || [
      { coins: 2500, rupees: 5 },
      { coins: 5000, rupees: 10 },
      { coins: 10000, rupees: 20 },
      { coins: 25000, rupees: 50 }
    ]);

    await db.execute(
      `INSERT INTO payout_methods (method_id, name, icon, placeholder, tiers_json, active) VALUES (?, ?, ?, ?, ?, 1)`,
      [methodId.toUpperCase(), name, icon || '💳', placeholder || 'Enter Details', tiersJson]
    );

    return res.json({ success: true, message: `Payout method '${name}' created successfully!` });
  } catch (err) {
    console.error('Error in createPayoutMethod:', err);
    return res.status(500).json({ error: 'Failed to create payout method' });
  }
}

// PUT /api/admin/payout-methods/:id
async function updatePayoutMethod(req, res) {
  try {
    const id = req.params.id;
    const { active, name, tiers, placeholder } = req.body;

    const rows = await db.query('SELECT * FROM payout_methods WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Payout method not found' });
    const m = rows[0];

    const tiersJson = tiers ? JSON.stringify(tiers) : m.tiers_json;

    await db.execute(
      `UPDATE payout_methods SET active = ?, name = ?, tiers_json = ?, placeholder = ? WHERE id = ?`,
      [active !== undefined ? (active ? 1 : 0) : m.active, name || m.name, tiersJson, placeholder || m.placeholder, m.id]
    );

    return res.json({ success: true, message: 'Payout method updated successfully' });
  } catch (err) {
    console.error('Error in updatePayoutMethod:', err);
    return res.status(500).json({ error: 'Failed to update payout method' });
  }
}

module.exports = {
  getStats,
  getUsers,
  updateUserStatus,
  updateUserBalance,
  getWithdrawals,
  processWithdrawal,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getReferralSettings,
  updateReferralSettings,
  getPayoutMethods,
  createPayoutMethod,
  updatePayoutMethod
};

const db = require('../config/db');

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SK';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/telegram/auth
async function handleAuth(req, res) {
  try {
    const { telegramUserId, name, username, referralCode } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ error: 'telegramUserId is required' });
    }

    const tgIdStr = String(telegramUserId);

    // Check if user exists
    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgIdStr]);

    let user;
    if (users.length > 0) {
      user = users[0];
      if (user.status === 'BANNED') {
        return res.status(403).json({ error: 'Your account has been banned from Survey King due to policy violations.' });
      }
      if (name || username) {
        await db.execute('UPDATE users SET name = ?, username = ? WHERE id = ?', [
          name || user.name,
          username || user.username,
          user.id
        ]);
        user.name = name || user.name;
        user.username = username || user.username;
      }
    } else {
      let myRefCode = generateReferralCode();
      let existingCode = await db.query('SELECT id FROM users WHERE referral_code = ?', [myRefCode]);
      while (existingCode.length > 0) {
        myRefCode = generateReferralCode();
        existingCode = await db.query('SELECT id FROM users WHERE referral_code = ?', [myRefCode]);
      }

      await db.execute(
        `INSERT INTO users (telegram_user_id, name, username, balance, referral_code, referred_by, status) 
         VALUES (?, ?, ?, 0.00, ?, ?, 'ACTIVE')`,
        [tgIdStr, name || 'Survey King User', username || 'user', myRefCode, referralCode || null]
      );

      const newUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgIdStr]);
      user = newUsers[0];

      if (referralCode && referralCode !== myRefCode) {
        const referrers = await db.query('SELECT * FROM users WHERE referral_code = ?', [referralCode]);
        if (referrers.length > 0) {
          const referrer = referrers[0];
          await db.execute(
            `INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, reward_amount)
             VALUES (?, ?, ?, 'PENDING', 1500.00)`,
            [referrer.id, user.id, referralCode]
          );
        }
      }
    }

    const stats = await getUserSummaryStats(user.id);

    return res.json({
      success: true,
      user: {
        id: user.id,
        telegramUserId: user.telegram_user_id,
        name: user.name,
        username: user.username,
        balance: parseFloat(user.balance || 0),
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        createdAt: user.created_at,
        stats
      }
    });
  } catch (err) {
    console.error('Error in handleAuth:', err);
    return res.status(500).json({ error: 'Failed to authenticate user', details: err.message });
  }
}

async function getUserSummaryStats(userId) {
  const completedParticipations = await db.query(
    `SELECT COUNT(*) as count FROM survey_participations WHERE user_id = ? AND status = 'COMPLETED'`,
    [userId]
  );
  
  const todayEarnings = await db.query(
    `SELECT SUM(amount) as total FROM wallet_transactions 
     WHERE user_id = ? AND type != 'WITHDRAWAL' AND DATE(created_at) = CURRENT_DATE()`,
    [userId]
  );

  const weekEarnings = await db.query(
    `SELECT SUM(amount) as total FROM wallet_transactions 
     WHERE user_id = ? AND type != 'WITHDRAWAL' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [userId]
  );

  const totalSurveysCompleted = completedParticipations[0]?.count || 0;
  const today = parseFloat(todayEarnings[0]?.total || 0);
  const week = parseFloat(weekEarnings[0]?.total || 0);

  return {
    surveysCompleted: totalSurveysCompleted,
    todayEarnings: today,
    weekEarnings: week
  };
}

// GET /api/telegram/me
async function getMe(req, res) {
  try {
    const tgIdStr = String(req.query.telegramUserId || '');
    if (!tgIdStr) {
      return res.status(400).json({ error: 'telegramUserId parameter required' });
    }

    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgIdStr]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const stats = await getUserSummaryStats(user.id);

    return res.json({
      success: true,
      user: {
        id: user.id,
        telegramUserId: user.telegram_user_id,
        name: user.name,
        username: user.username,
        balance: parseFloat(user.balance || 0),
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        createdAt: user.created_at,
        stats
      }
    });
  } catch (err) {
    console.error('Error in getMe:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/telegram/surveys
async function getSurveys(req, res) {
  try {
    const surveys = await db.query('SELECT * FROM surveys WHERE active = 1 ORDER BY reward DESC');
    const formatted = surveys.map(s => ({
      id: s.id,
      surveyId: s.survey_id,
      title: s.title,
      reward: parseFloat(s.reward),
      estimatedMinutes: s.estimated_minutes,
      provider: s.provider,
      category: s.category,
      icon: s.icon
    }));

    return res.json({ success: true, surveys: formatted });
  } catch (err) {
    console.error('Error in getSurveys:', err);
    return res.status(500).json({ error: 'Failed to fetch surveys' });
  }
}

// POST /api/telegram/surveys/:id/start
async function startSurvey(req, res) {
  try {
    const surveyId = req.params.id;
    const { telegramUserId } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ error: 'telegramUserId is required' });
    }

    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(telegramUserId)]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    if (user.status === 'BANNED') {
      return res.status(403).json({ error: 'Your account is banned. You cannot take surveys.' });
    }

    const surveys = await db.query('SELECT * FROM surveys WHERE survey_id = ? OR id = ?', [surveyId, surveyId]);
    if (surveys.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    const survey = surveys[0];

    const participationId = 'PART_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);

    await db.execute(
      `INSERT INTO survey_participations (participation_id, user_id, survey_id, provider, status, reward)
       VALUES (?, ?, ?, ?, 'STARTED', ?)`,
      [participationId, user.id, survey.survey_id, survey.provider, survey.reward]
    );

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const providerUrl = `${backendUrl}/api/simulator?participationId=${participationId}&surveyId=${survey.survey_id}&reward=${survey.reward}`;

    return res.json({
      success: true,
      participation: {
        participationId,
        surveyId: survey.survey_id,
        title: survey.title,
        reward: parseFloat(survey.reward),
        provider: survey.provider,
        status: 'STARTED',
        providerUrl
      }
    });
  } catch (err) {
    console.error('Error in startSurvey:', err);
    return res.status(500).json({ error: 'Failed to start survey' });
  }
}

// GET /api/telegram/transactions
async function getTransactions(req, res) {
  try {
    const tgIdStr = String(req.query.telegramUserId || '');
    if (!tgIdStr) {
      return res.status(400).json({ error: 'telegramUserId required' });
    }

    const users = await db.query('SELECT id FROM users WHERE telegram_user_id = ?', [tgIdStr]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = users[0].id;
    const txs = await db.query(
      `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const formatted = txs.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      referenceId: t.reference_id,
      description: t.description,
      createdAt: t.created_at
    }));

    return res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error('Error in getTransactions:', err);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

// GET /api/telegram/referrals
async function getReferrals(req, res) {
  try {
    const tgIdStr = String(req.query.telegramUserId || '');
    if (!tgIdStr) {
      return res.status(400).json({ error: 'telegramUserId required' });
    }

    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgIdStr]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    const refs = await db.query(
      `SELECT r.*, u.name as referredName, u.username as referredUsername, u.created_at as joinedAt 
       FROM referrals r 
       JOIN users u ON r.referred_user_id = u.id 
       WHERE r.referrer_user_id = ? ORDER BY r.created_at DESC`,
      [user.id]
    );

    const totalEarnedRows = await db.query(
      `SELECT SUM(amount) as total FROM wallet_transactions WHERE user_id = ? AND type = 'REFERRAL_REWARD'`,
      [user.id]
    );

    const totalEarned = parseFloat(totalEarnedRows[0]?.total || 0);

    return res.json({
      success: true,
      referralCode: user.referral_code,
      referralLink: `https://t.me/survey_king_bot?start=${user.referral_code}`,
      totalReferrals: refs.length,
      totalEarned,
      referrals: refs.map(r => ({
        id: r.id,
        name: r.referredName,
        username: r.referredUsername,
        status: r.status,
        rewardAmount: parseFloat(r.reward_amount),
        joinedAt: r.joinedAt
      }))
    });
  } catch (err) {
    console.error('Error in getReferrals:', err);
    return res.status(500).json({ error: 'Failed to fetch referrals' });
  }
}

// POST /api/telegram/withdraw
async function requestWithdrawal(req, res) {
  try {
    const { telegramUserId, amount, upiId } = req.body;

    if (!telegramUserId || !amount || !upiId) {
      return res.status(400).json({ error: 'telegramUserId, amount, and upiId are required' });
    }

    const withdrawAmt = parseFloat(amount);
    if (isNaN(withdrawAmt) || withdrawAmt < 5000) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is 5,000 Coins (₹50.00)' });
    }

    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(telegramUserId)]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const currentBalance = parseFloat(user.balance || 0);

    if (currentBalance < withdrawAmt) {
      return res.status(400).json({ error: `Insufficient coin balance. Current balance is ${currentBalance.toLocaleString()} Coins` });
    }

    const newBalance = currentBalance - withdrawAmt;
    const rupeeValue = (withdrawAmt / 100).toFixed(2);
    await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

    const wResult = await db.execute(
      `INSERT INTO withdrawals (user_id, amount, upi_id, status) VALUES (?, ?, ?, 'PENDING')`,
      [user.id, withdrawAmt, upiId]
    );

    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'WITHDRAWAL', ?, ?, ?)`,
      [user.id, -withdrawAmt, `WITHDRAW_${wResult.insertId}`, `UPI Withdrawal of ${withdrawAmt.toLocaleString()} Coins (₹${rupeeValue}) to ${upiId}`]
    );

    return res.json({
      success: true,
      message: `Withdrawal request of ${withdrawAmt.toLocaleString()} Coins (₹${rupeeValue}) submitted successfully!`,
      newBalance,
      withdrawal: {
        id: wResult.insertId,
        amount: withdrawAmt,
        rupeeValue,
        upiId,
        status: 'PENDING'
      }
    });
  } catch (err) {
    console.error('Error in requestWithdrawal:', err);
    return res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
}

module.exports = {
  handleAuth,
  getMe,
  getSurveys,
  startSurvey,
  getTransactions,
  getReferrals,
  requestWithdrawal
};

const db = require('../config/db');
const { notifyReferralReward } = require('../bot/telegramBot');

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
    const clientIp = req.clientIp || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '127.0.0.1';

    console.log(`====================================================`);
    console.log(`🔑 [TG AUTH EVENT] Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 Telegram User ID: ${tgIdStr} | Name: ${name || 'N/A'} | Username: @${username || 'N/A'}`);
    console.log(`🌐 Client IP: ${clientIp}`);
    console.log(`🎁 Start Param / Referral Code Used: ${referralCode || 'NONE (Direct Sign-up)'}`);
    console.log(`====================================================`);

    // Check if user exists
    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgIdStr]);

    // Fetch dynamic referral & welcome bonus settings
    const settingsRows = await db.query('SELECT * FROM platform_settings WHERE id = 1');
    const refSettings = settingsRows[0] || { referrer_reward_coins: 1000, referee_reward_coins: 500, referral_trigger: 'FIRST_SURVEY' };
    const welcomeBonusCoins = parseFloat(refSettings.referee_reward_coins || 500);
    const referrerBonusCoins = parseFloat(refSettings.referrer_reward_coins || 1000);

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

      // Check if user has not yet received their Welcome Bonus (e.g. signed up earlier)
      const existingBonus = await db.query(
        "SELECT id FROM wallet_transactions WHERE user_id = ? AND type IN ('WELCOME_BONUS', 'REFERRAL_WELCOME_BONUS')",
        [user.id]
      );
      if (existingBonus.length === 0 && welcomeBonusCoins > 0) {
        const currentBal = parseFloat(user.balance || 0);
        const newBal = currentBal + welcomeBonusCoins;
        await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBal, user.id]);
        await db.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
           VALUES (?, 'WELCOME_BONUS', ?, 'WELCOME_NEW_USER', 'Welcome Bonus for joining Survey King')`,
          [user.id, welcomeBonusCoins]
        );
        user.balance = newBal;
        console.log(`🎁 Welcome Bonus of +${welcomeBonusCoins} Coins automatically credited to user ${user.name} (#${user.telegram_user_id})!`);
        notifyReferralReward(user.telegram_user_id, welcomeBonusCoins, newBal, 'Welcome Bonus');
      }
    } else {
      let myRefCode = generateReferralCode();
      let existingCode = await db.query('SELECT id FROM users WHERE referral_code = ?', [myRefCode]);
      while (existingCode.length > 0) {
        myRefCode = generateReferralCode();
        existingCode = await db.query('SELECT id FROM users WHERE referral_code = ?', [myRefCode]);
      }

      let validReferrer = null;
      if (referralCode && referralCode !== myRefCode) {
        const referrers = await db.query('SELECT * FROM users WHERE referral_code = ?', [referralCode]);
        if (referrers.length > 0) {
          validReferrer = referrers[0];
        }
      }

      const initialBalance = welcomeBonusCoins;

      await db.execute(
        `INSERT INTO users (telegram_user_id, name, username, balance, referral_code, referred_by, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [tgIdStr, name || 'Survey King User', username || 'user', initialBalance, myRefCode, validReferrer ? referralCode : null]
      );

      const newUsers = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgIdStr]);
      user = newUsers[0];

      // If joined with referral code, record pending referral for inviter
      if (validReferrer) {
        await db.execute(
          `INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, reward_amount)
           VALUES (?, ?, ?, 'PENDING', ?)`,
          [validReferrer.id, user.id, referralCode, referrerBonusCoins]
        );
      }

      // Record Welcome Bonus transaction
      if (welcomeBonusCoins > 0) {
        await db.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
           VALUES (?, 'WELCOME_BONUS', ?, ?, ?)`,
          [user.id, welcomeBonusCoins, validReferrer ? `JOIN_REF_${validReferrer.id}` : 'WELCOME_DIRECT', validReferrer ? `Instant Welcome Bonus for using invite code ${referralCode}` : 'Welcome Bonus for joining Survey King']
        );

        console.log(`🎁 Instant Welcome Bonus of +${welcomeBonusCoins} Coins credited to new user ${user.name} (#${user.telegram_user_id})!`);
        notifyReferralReward(user.telegram_user_id, welcomeBonusCoins, initialBalance, 'Welcome Bonus');
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
        googleAdId: user.google_ad_id || '',
        iosIdfaId: user.ios_idfa_id || '',
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
        googleAdId: user.google_ad_id || '',
        iosIdfaId: user.ios_idfa_id || '',
        createdAt: user.created_at,
        stats
      }
    });
  } catch (err) {
    console.error('Error in getMe:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const crypto = require('crypto');

// GET /api/telegram/surveys
async function getSurveys(req, res) {
  try {
    const tgUserId = String(req.query.telegramUserId || '1981634693');
    const clientIp = req.clientIp || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '106.77.190.23';
    const userAgent = req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    const cpxAppId = process.env.CPX_APP_ID || '35805';
    const cpxSecHash = process.env.CPX_SECURITY_HASH || 'rocaZHPRG8u3oHgTTJb5Yuwccm45kmlF';

    // Calculate MD5 hash: md5(ext_user_id - cpxSecHash)
    const hash = crypto.createHash('md5').update(`${tgUserId}-${cpxSecHash}`).digest('hex');

    // Official CPX API URL structure according to publisher.cpx-research.com/documentation/indexapi.php
    const cpxApiUrl = `https://live-api.cpx-research.com/api/get-surveys.php?app_id=${cpxAppId}&email=&ext_user_id=${tgUserId}&subid_1=&subid_2=&output_method=api&ip_user=${encodeURIComponent(clientIp)}&user_agent=${encodeURIComponent(userAgent)}&limit=12&secure_hash=${hash}`;

    console.log(`📡 [FETCHING CPX SURVEYS API] User: ${tgUserId} | IP: ${clientIp}`);

    let liveCpxSurveys = [];
    try {
      const cpxRes = await fetch(cpxApiUrl);
      const cpxData = await cpxRes.json();

      if (cpxData && (cpxData.status === 'success' || cpxData.api === 'success') && Array.isArray(cpxData.surveys) && cpxData.surveys.length > 0) {
        liveCpxSurveys = cpxData.surveys.map((s) => {
          const payoutCoins = parseFloat(s.payout || 0) > 0 
            ? parseFloat(s.payout) 
            : Math.round(parseFloat(s.payout_publisher_usd || 0.50) * 10000);

          return {
            id: String(s.id),
            surveyId: String(s.id),
            title: s.title || `CPX Market Research #${s.id}`,
            reward: Math.max(100, Math.round(payoutCoins)),
            estimatedMinutes: parseInt(s.loi || 8, 10),
            provider: 'CPX Research',
            category: s.category || 'General',
            conversionRate: s.conversion_rate || '20',
            rating: parseFloat(s.statistics_rating_avg || 4.5),
            score: s.score || '10.0',
            icon: '🎯',
            href: s.href_new || s.href,
            isLiveCPX: true
          };
        });
        console.log(`✅ Loaded ${liveCpxSurveys.length} live CPX surveys for user ${tgUserId}!`);
      } else {
        console.log(`ℹ️ User ${tgUserId} unprofiled in CPX (count=0). Fetching live CPX inventory pool...`);
        const poolUser = '4779683';
        const poolHash = crypto.createHash('md5').update(`${poolUser}-${cpxSecHash}`).digest('hex');
        const poolUrl = `https://live-api.cpx-research.com/api/get-surveys.php?app_id=${cpxAppId}&email=&ext_user_id=${poolUser}&subid_1=&subid_2=&output_method=api&ip_user=${encodeURIComponent(clientIp)}&user_agent=${encodeURIComponent(userAgent)}&limit=12&secure_hash=${poolHash}`;
        
        const poolRes = await fetch(poolUrl);
        const poolData = await poolRes.json();
        if (poolData && Array.isArray(poolData.surveys) && poolData.surveys.length > 0) {
          liveCpxSurveys = poolData.surveys.map((s) => {
            const payoutCoins = parseFloat(s.payout || 0) > 0 
              ? parseFloat(s.payout) 
              : Math.round(parseFloat(s.payout_publisher_usd || 0.50) * 10000);

            // Bind direct survey entry link to the current user's telegram user ID
            const userLink = (s.href_new || s.href || '').replace(poolUser, tgUserId);

            return {
              id: String(s.id),
              surveyId: String(s.id),
              title: s.title || `CPX Market Research #${s.id}`,
              reward: Math.max(100, Math.round(payoutCoins)),
              estimatedMinutes: parseInt(s.loi || 8, 10),
              provider: 'CPX Research',
              category: s.category || 'General',
              conversionRate: s.conversion_rate || '20',
              rating: parseFloat(s.statistics_rating_avg || 4.5),
              score: s.score || '10.0',
              icon: '🎯',
              href: userLink,
              isLiveCPX: true
            };
          });
          console.log(`✅ Loaded ${liveCpxSurveys.length} real CPX surveys bound to user ${tgUserId}!`);
        }
      }
    } catch (cpxErr) {
      console.error('Error fetching CPX API:', cpxErr.message);
    }

    // Fetch Live TimeWall Surveys
    let liveTimeWallSurveys = [];
    const timeWallApiKey = process.env.TIMEWALL_API_KEY || 'tw_0b00b78ae1f3b367a700e4d16f8b7af5e7c48580d3a06e0ddeb44a1c516159ba';
    if (timeWallApiKey) {
      try {
        console.log(`⏱️ [FETCHING TIMEWALL SURVEYS API] User: ${tgUserId}`);
        const twRes = await fetch('https://api.timewall.io/get-surveys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${timeWallApiKey}`
          },
          body: JSON.stringify({
            uid: String(tgUserId),
            ip: clientIp,
            user_agent: userAgent,
            screen_width: 390,
            screen_height: 844,
            limit: 10,
            provider: 'all'
          })
        });

        const twData = await twRes.json();
        if (twData && twData.success && Array.isArray(twData.surveys) && twData.surveys.length > 0) {
          liveTimeWallSurveys = twData.surveys.map(s => {
            const coinAmount = parseInt(s.currency_amount || 0, 10);

            return {
              id: `tw_${s.id}`,
              surveyId: String(s.id),
              title: `TimeWall Study #${String(s.id).substring(0, 8)}`,
              reward: coinAmount,
              estimatedMinutes: parseInt(s.loi || 10, 10),
              provider: 'TimeWall',
              category: 'Market Research',
              rating: 4.8,
              score: '10.0',
              icon: '⏱️',
              href: s.link,
              isLiveTimeWall: true
            };
          });
          console.log(`✅ Loaded ${liveTimeWallSurveys.length} live TimeWall surveys for user ${tgUserId}!`);
        }
      } catch (twErr) {
        console.error('Error fetching TimeWall API:', twErr.message);
      }
    }

    // Only custom surveys created by admin in admin panel (if any)
    const customSurveys = await db.query('SELECT * FROM surveys WHERE active = 1 ORDER BY priority DESC, reward DESC');
    const formattedCustom = customSurveys.map(s => ({
      id: s.id,
      surveyId: s.survey_id,
      title: s.title,
      reward: parseFloat(s.reward),
      estimatedMinutes: s.estimated_minutes,
      provider: s.provider || 'Custom Survey',
      category: s.category || 'General',
      icon: s.icon || '📝',
      href: s.entry_url || null,
      isLiveCPX: false
    }));

    const allSurveys = [...liveCpxSurveys, ...liveTimeWallSurveys, ...formattedCustom];

    return res.json({
      success: true,
      surveys: allSurveys
    });
  } catch (err) {
    console.error('Error in getSurveys:', err);
    return res.status(500).json({ error: 'Failed to fetch surveys' });
  }
}

// POST /api/telegram/surveys/:id/start
async function startSurvey(req, res) {
  try {
    const surveyId = req.params.id;
    const { telegramUserId, directHref } = req.body;

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

    let surveyTitle = 'CPX Research Survey';
    let surveyReward = 5000;
    let providerName = 'CPX Research';

    const surveys = await db.query('SELECT * FROM surveys WHERE survey_id = ? OR id = ?', [surveyId, surveyId]);
    if (surveys.length > 0) {
      const s = surveys[0];
      surveyTitle = s.title;
      surveyReward = parseFloat(s.reward);
      providerName = s.provider;
    }

    const participationId = 'PART_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);

    await db.execute(
      `INSERT INTO survey_participations (participation_id, user_id, survey_id, provider, status, reward)
       VALUES (?, ?, ?, ?, 'STARTED', ?)`,
      [participationId, user.id, surveyId, providerName, surveyReward]
    );

    const cpxAppId = process.env.CPX_APP_ID || '35805';
    const cpxSecHash = process.env.CPX_SECURITY_HASH || 'rocaZHPRG8u3oHgTTJb5Yuwccm45kmlF';
    const hash = crypto.createHash('md5').update(`${user.telegram_user_id}-${cpxSecHash}`).digest('hex');

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    let providerUrl = directHref || `https://offers.cpx-research.com/index.php?app_id=${cpxAppId}&ext_user_id=${user.telegram_user_id}&secure_hash=${hash}&subid_1=${participationId}`;

    if (!directHref && providerName !== 'CPX Research Live') {
      providerUrl = `${backendUrl}/api/simulator?participationId=${participationId}&surveyId=${surveyId}&reward=${surveyReward}`;
    }

    return res.json({
      success: true,
      participation: {
        participationId,
        surveyId,
        title: surveyTitle,
        reward: surveyReward,
        provider: providerName,
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
    const { telegramUserId, amount, upiId, method } = req.body;

    if (!telegramUserId || !amount || !upiId) {
      return res.status(400).json({ error: 'telegramUserId, amount, and withdrawal details are required' });
    }

    const settingsRows = await db.query('SELECT min_withdrawal_coins FROM platform_settings WHERE id = 1');
    const minThreshold = parseFloat(settingsRows[0]?.min_withdrawal_coins || 2500);

    const withdrawAmt = parseFloat(amount);
    if (isNaN(withdrawAmt) || withdrawAmt < minThreshold) {
      return res.status(400).json({ error: `Minimum withdrawal tier is ${minThreshold.toLocaleString()} Coins (₹${(minThreshold / 100).toFixed(2)})` });
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

    const payoutMethod = method || 'UPI';
    const newBalance = currentBalance - withdrawAmt;
    const rupeeValue = (withdrawAmt / 500).toFixed(2); // Tier conversion or 500 Coins = ₹1 depending on rate or 1000 = ₹10
    const inrAmount = (withdrawAmt / 100).toFixed(2);

    await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

    const wResult = await db.execute(
      `INSERT INTO withdrawals (user_id, method, amount, upi_id, status) VALUES (?, ?, ?, ?, 'PENDING')`,
      [user.id, payoutMethod, withdrawAmt, upiId]
    );

    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'WITHDRAWAL', ?, ?, ?)`,
      [user.id, -withdrawAmt, `WITHDRAW_${wResult.insertId}`, `${payoutMethod} Payout of ${withdrawAmt.toLocaleString()} Coins (₹${inrAmount}) to ${upiId}`]
    );

    return res.json({
      success: true,
      message: `Withdrawal request of ${withdrawAmt.toLocaleString()} Coins (₹${inrAmount}) via ${payoutMethod} submitted successfully!`,
      newBalance,
      withdrawal: {
        id: wResult.insertId,
        method: payoutMethod,
        amount: withdrawAmt,
        rupeeValue: inrAmount,
        upiId,
        status: 'PENDING'
      }
    });
  } catch (err) {
    console.error('Error in requestWithdrawal:', err);
    return res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
}

// POST /api/telegram/promo/claim
async function claimPromoCode(req, res) {
  try {
    const { telegramUserId, code } = req.body;
    if (!telegramUserId || !code) {
      return res.status(400).json({ error: 'telegramUserId and promo code are required' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(telegramUserId)]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    if (user.status === 'BANNED') {
      return res.status(403).json({ error: 'Your account is suspended.' });
    }

    // Check promo code in DB
    const promos = await db.query('SELECT * FROM promo_codes WHERE UPPER(code) = ? AND active = 1', [cleanCode]);
    if (promos.length === 0) {
      return res.status(400).json({ error: `Invalid or expired Lifafa code: '${cleanCode}'. Join our Telegram channel for active codes!` });
    }

    const promo = promos[0];
    if (promo.max_uses > 0 && promo.current_uses >= promo.max_uses) {
      return res.status(400).json({ error: `This Lifafa code has reached its maximum claim limit! Join @SatyainfotechNetworks for new drops.` });
    }

    // Check if user already claimed this promo
    const existing = await db.query('SELECT id FROM promo_redemptions WHERE user_id = ? AND promo_code_id = ?', [user.id, promo.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: `You have already claimed this Lifafa code (${cleanCode})!` });
    }

    const rewardCoins = parseInt(promo.reward_coins, 10);
    const currentBalance = parseFloat(user.balance || 0);
    const newBalance = currentBalance + rewardCoins;

    // Credit user balance
    await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

    // Update promo usage
    await db.execute('UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ?', [promo.id]);

    // Record redemption
    await db.execute(
      `INSERT INTO promo_redemptions (user_id, promo_code_id, code, reward_coins) VALUES (?, ?, ?, ?)`,
      [user.id, promo.id, cleanCode, rewardCoins]
    );

    // Record wallet transaction
    await db.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
       VALUES (?, 'PROMO_CODE', ?, ?, ?)`,
      [user.id, rewardCoins, `LIFAFA_${cleanCode}_${promo.id}`, `Claimed Lifafa Promo Code (${cleanCode})`]
    );

    try {
      notifyReferralReward(user.telegram_user_id, rewardCoins, newBalance, `Lifafa Promo: ${cleanCode}`);
    } catch (e) {}

    return res.json({
      success: true,
      message: `🎉 Lifafa Claimed Successfully! +${rewardCoins.toLocaleString()} Coins added to your wallet!`,
      rewardCoins,
      newBalance,
      code: cleanCode
    });
  } catch (err) {
    console.error('Error claiming promo code:', err);
    return res.status(500).json({ error: 'Failed to claim promo code', details: err.message });
  }
}

// POST /api/telegram/ad-ids
async function updateAdIds(req, res) {
  try {
    const { telegramUserId, googleAdId, iosIdfaId } = req.body;
    if (!telegramUserId) {
      return res.status(400).json({ error: 'telegramUserId is required' });
    }

    const users = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(telegramUserId)]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const newGaid = googleAdId !== undefined ? (googleAdId ? String(googleAdId).trim() : null) : user.google_ad_id;
    const newIdfa = iosIdfaId !== undefined ? (iosIdfaId ? String(iosIdfaId).trim() : null) : user.ios_idfa_id;

    await db.execute('UPDATE users SET google_ad_id = ?, ios_idfa_id = ? WHERE id = ?', [
      newGaid,
      newIdfa,
      user.id
    ]);

    return res.json({
      success: true,
      message: 'Advertising IDs updated successfully!',
      googleAdId: newGaid || '',
      iosIdfaId: newIdfa || ''
    });
  } catch (err) {
    console.error('Error updating advertising IDs:', err);
    return res.status(500).json({ error: 'Failed to update advertising IDs', details: err.message });
  }
}

// GET /api/telegram/leaderboard
async function getLeaderboard(req, res) {
  try {
    const period = req.query.period || 'all'; // 'today', 'weekly', 'all'
    const tgUserId = String(req.query.telegramUserId || '');

    let dateFilter = '';
    if (period === 'today') {
      dateFilter = 'AND DATE(wt.created_at) = CURRENT_DATE()';
    } else if (period === 'weekly') {
      dateFilter = 'AND wt.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    }

    let topUsers = [];
    try {
      if (period === 'all') {
        topUsers = await db.query(`
          SELECT 
            u.id, 
            u.telegram_user_id, 
            u.name, 
            u.username, 
            u.balance as total_earnings,
            COUNT(DISTINCT sp.id) as surveys_count
          FROM users u
          LEFT JOIN survey_participations sp ON sp.user_id = u.id AND sp.status = 'COMPLETED'
          WHERE u.status = 'ACTIVE'
          GROUP BY u.id
          ORDER BY total_earnings DESC
          LIMIT 25
        `);
      } else {
        topUsers = await db.query(`
          SELECT 
            u.id, 
            u.telegram_user_id, 
            u.name, 
            u.username, 
            COALESCE(SUM(wt.amount), 0) as total_earnings,
            COUNT(DISTINCT sp.id) as surveys_count
          FROM users u
          JOIN wallet_transactions wt ON wt.user_id = u.id AND wt.type != 'WITHDRAWAL' ${dateFilter}
          LEFT JOIN survey_participations sp ON sp.user_id = u.id AND sp.status = 'COMPLETED'
          WHERE u.status = 'ACTIVE'
          GROUP BY u.id
          ORDER BY total_earnings DESC
          LIMIT 25
        `);
      }
    } catch (dbErr) {
      console.warn('Leaderboard query fallback:', dbErr.message);
    }

    const sampleEarners = [
      { name: 'Rahul Sharma', username: 'rahul_surveys', total_earnings: 285400, surveys_count: 84 },
      { name: 'Aakash Verma', username: 'aakash_pro', total_earnings: 219800, surveys_count: 67 },
      { name: 'Priya Patel', username: 'priya_p', total_earnings: 194500, surveys_count: 59 },
      { name: 'Vikram Singh', username: 'vikram99', total_earnings: 168200, surveys_count: 48 },
      { name: 'Sneha Roy', username: 'sneha_r', total_earnings: 142000, surveys_count: 41 },
      { name: 'Devraj SIT', username: 'Devraj069', total_earnings: 135000, surveys_count: 38 },
      { name: 'Ankit Gupta', username: 'ankit_g', total_earnings: 118400, surveys_count: 35 },
      { name: 'Kavita Joshi', username: 'kavita_j', total_earnings: 98500, surveys_count: 29 },
      { name: 'Rohan Mehta', username: 'rohan_m', total_earnings: 87200, surveys_count: 26 },
      { name: 'Sanjay Kumar', username: 'sanjay_k', total_earnings: 74600, surveys_count: 21 }
    ];

    let leaderboardList = (topUsers || []).map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name || 'Survey User',
      username: u.username ? `@${u.username}` : '@user',
      totalEarnings: Math.round(parseFloat(u.total_earnings || 0)),
      rupees: (parseFloat(u.total_earnings || 0) / 100).toFixed(0),
      surveysCount: parseInt(u.surveys_count || 0, 10),
      isCurrentUser: u.telegram_user_id === tgUserId
    }));

    if (leaderboardList.length < 5) {
      const multiplier = period === 'today' ? 0.08 : (period === 'weekly' ? 0.35 : 1);
      const combined = [...leaderboardList];
      
      sampleEarners.forEach((s) => {
        if (!combined.some(c => c.username === `@${s.username}`)) {
          combined.push({
            id: 'sample_' + s.username,
            name: s.name,
            username: `@${s.username}`,
            totalEarnings: Math.round(s.total_earnings * multiplier),
            rupees: ((s.total_earnings * multiplier) / 100).toFixed(0),
            surveysCount: Math.max(1, Math.round(s.surveys_count * multiplier)),
            isCurrentUser: false
          });
        }
      });

      combined.sort((a, b) => b.totalEarnings - a.totalEarnings);
      leaderboardList = combined.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    let currentUserRank = leaderboardList.find(u => u.isCurrentUser);
    if (!currentUserRank && tgUserId) {
      const userRows = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [tgUserId]);
      if (userRows.length > 0) {
        const u = userRows[0];
        const bal = parseFloat(u.balance || 0);
        currentUserRank = {
          rank: leaderboardList.filter(l => l.totalEarnings > bal).length + 1,
          id: u.id,
          name: u.name,
          username: u.username ? `@${u.username}` : '@user',
          totalEarnings: Math.round(bal),
          rupees: (bal / 100).toFixed(0),
          surveysCount: u.stats?.surveysCompleted || 0,
          isCurrentUser: true
        };
      }
    }

    return res.json({
      success: true,
      period,
      leaderboard: leaderboardList.slice(0, 20),
      currentUserRank: currentUserRank || { rank: 18, totalEarnings: 0, rupees: '0', surveysCount: 0, isCurrentUser: true }
    });
  } catch (err) {
    console.error('Error in getLeaderboard:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
}

module.exports = {
  handleAuth,
  getMe,
  getSurveys,
  startSurvey,
  getTransactions,
  getReferrals,
  requestWithdrawal,
  claimPromoCode,
  updateAdIds,
  getLeaderboard
};

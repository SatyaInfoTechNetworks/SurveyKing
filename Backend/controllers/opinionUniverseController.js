const db = require('../config/db');
const https = require('https');
const http = require('http');
require('dotenv').config();

const OU_PUB_ID = process.env.OU_PUB_ID || '1863';
const OU_APP_ID = process.env.OU_APP_ID || 'ID_1c73aa4e879a0aab3555de6b40256fed';
const OU_API_KEY = process.env.OU_API_KEY || '975ae2dffc8c54f77e8b4bde9c131f95707e4b4434f6bfa2';
const OU_SOURCE = process.env.OU_SOURCE || 'survey_king';

function generateClickId(userId, externalOfferId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  return `SK_${userId}_${externalOfferId}_${rand}_${Date.now()}`;
}

function httpGet(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from Opinion Universe API')); }
      });
    });
    req.on('error', reject);
    // Abort if no response within timeoutMs
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Opinion Universe API timed out after ${timeoutMs / 1000}s`));
    });
  });
}

async function fetchLiveOffers(req, res) {
  try {
    // Accept filter params from admin UI
    const country   = req.query.country   || 'All';
    const platform  = req.query.platform  || 'All';
    const type      = req.query.type      || 'live_surveys';
    const payoutType = req.query.payoutType || 'All';

    // Build URL with filters forwarded to OU API
    const params = new URLSearchParams({
      key:       OU_API_KEY,
      pubid:     OU_PUB_ID,
      app_id:    OU_APP_ID,
      type,
      ...(country  !== 'All' && { country }),
      ...(platform !== 'All' && { platform }),
      ...(payoutType !== 'All' && { payoutType })
    });
    const url = `https://api.opinionuniverse.com/publisher/offersFeed?${params.toString()}`;

    console.log('============================================');
    console.log('OU API REQUEST URL:', url);
    console.log('Filters → country:', country, '| platform:', platform, '| type:', type, '| payoutType:', payoutType);
    console.log('============================================');

    const data = await httpGet(url, 15000);

    // Log full raw response
    console.log('OU API RAW RESPONSE:');
    console.log(JSON.stringify(data, null, 2));
    console.log('============================================');

    const isSuccess =
      (data.code === 200 || data.code === '200' || data.status === 200 || data.status === 'success') &&
      (data.message === 'success' || data.status === 'success' || data.success === true);

    const offersRaw =
      data?.data?.response?.offers ||
      data?.data?.offers ||
      data?.response?.offers ||
      data?.offers ||
      [];

    if (!isSuccess && offersRaw.length === 0) {
      console.error('OU API non-success response. Full response logged above.');
      return res.status(502).json({
        success: false,
        error: `Opinion Universe API error (code: ${data.code}, message: ${data.message})`,
        raw: data
      });
    }

    console.log(`OU API: Found ${offersRaw.length} offers.`);
    return res.json({
      success: true,
      count: offersRaw.length,
      currencyName: data?.data?.response?.currency_name || data?.data?.currency_name || 'Points',
      filtersApplied: { country, platform, type, payoutType },
      offers: offersRaw.map(o => ({
        offerId: o.offer_id,
        offerName: o.offer_name,
        offerDesc: o.offer_desc || null,
        callToAction: o.call_to_action || null,
        offerUrlTemplate: o.offer_url_easy || o.offer_url || '',
        amount: Math.round(parseFloat(o.amount || 0)),
        payout: parseFloat(o.payout || 0),
        payoutType: o.payoutType || 'flat',
        offerType: o.offer_type || 'Consumer',
        imageUrl: o.image_url || null,
        loi: o.loi || 0,
        ir: o.ir || 0,
        countries: o.countries || country,
        devices: o.devices || platform
      }))
    });
  } catch (err) {
    console.error('Error fetching OU offers:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch offers: ' + err.message });
  }
}


async function getAdminSurveys(req, res) {
  try {
    const statusFilter = req.query.status;
    let queryStr = 'SELECT * FROM opinion_universe_surveys WHERE status != ? ORDER BY is_featured DESC, created_at DESC';
    let params = ['deleted'];
    if (statusFilter === 'deleted') {
      queryStr = 'SELECT * FROM opinion_universe_surveys WHERE status = ? ORDER BY updated_at DESC';
      params = ['deleted'];
    } else if (statusFilter === 'all') {
      queryStr = 'SELECT * FROM opinion_universe_surveys ORDER BY is_featured DESC, created_at DESC';
      params = [];
    }
    const rows = await db.query(queryStr, params);
    return res.json({ success: true, surveys: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch surveys' });
  }
}

async function addSurvey(req, res) {
  try {
    const { offerId, offerName, offerDesc, offerUrlTemplate, imageUrl, amount, payout, loi, ir, countries, devices, coinsReward } = req.body;
    if (!offerId || !offerName || !offerUrlTemplate) {
      return res.status(400).json({ success: false, error: 'offerId, offerName, and offerUrlTemplate are required' });
    }
    if (!offerUrlTemplate.includes('{YOUR_CLICK_ID}')) {
      return res.status(400).json({ success: false, error: 'URL template must contain {YOUR_CLICK_ID}' });
    }
    const coins = parseInt(coinsReward, 10) || Math.round(parseFloat(amount || 0));
    await db.execute(
      `INSERT INTO opinion_universe_surveys
        (provider, external_offer_id, title, description, survey_url_template, image_url, payout, currency, loi, ir, countries, devices, status, is_featured, coins_reward)
       VALUES ('opinion_universe', ?, ?, ?, ?, ?, ?, 'coins', ?, ?, ?, ?, 'active', 0, ?)
       ON DUPLICATE KEY UPDATE
         title=VALUES(title), description=VALUES(description), survey_url_template=VALUES(survey_url_template),
         image_url=VALUES(image_url), payout=VALUES(payout), loi=VALUES(loi), ir=VALUES(ir),
         countries=VALUES(countries), devices=VALUES(devices), coins_reward=VALUES(coins_reward),
         status='active', updated_at=NOW()`,
      [String(offerId), offerName, offerDesc || null, offerUrlTemplate, imageUrl || null,
       parseFloat(payout || amount || 0), parseInt(loi || 0), parseInt(ir || 0), countries || 'All', devices || 'All', coins]
    );
    return res.json({ success: true, message: `Survey "${offerName}" added to Survey King!` });
  } catch (err) {
    console.error('Error adding OU survey:', err);
    return res.status(500).json({ success: false, error: 'Failed to add survey: ' + err.message });
  }
}

async function updateSurveyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or inactive' });
    }
    await db.execute('UPDATE opinion_universe_surveys SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, message: `Survey ${status === 'active' ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
}

async function featureSurvey(req, res) {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    await db.execute('UPDATE opinion_universe_surveys SET is_featured = ? WHERE id = ?', [isFeatured ? 1 : 0, id]);
    return res.json({ success: true, message: `Survey ${isFeatured ? 'featured' : 'unfeatured'}.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update featured status' });
  }
}

async function deleteSurvey(req, res) {
  try {
    const { id } = req.params;
    await db.execute('UPDATE opinion_universe_surveys SET status = ? WHERE id = ?', ['deleted', id]);
    return res.json({ success: true, message: 'Survey moved to Trash (temporarily deleted).' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to move survey to trash' });
  }
}

async function restoreSurvey(req, res) {
  try {
    const { id } = req.params;
    await db.execute('UPDATE opinion_universe_surveys SET status = ? WHERE id = ?', ['active', id]);
    return res.json({ success: true, message: 'Survey restored to active!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to restore survey' });
  }
}

async function permanentDeleteSurvey(req, res) {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM opinion_universe_surveys WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Survey permanently deleted from database.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to permanently delete survey' });
  }
}

async function updateSurveyCoins(req, res) {
  try {
    const { id } = req.params;
    const { coinsReward } = req.body;
    await db.execute('UPDATE opinion_universe_surveys SET coins_reward = ? WHERE id = ?', [parseInt(coinsReward, 10) || 0, id]);
    return res.json({ success: true, message: 'Coins reward updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update coins' });
  }
}

async function updateSurveyExtraInfo(req, res) {
  try {
    const { id } = req.params;
    const { description, qualificationTips, extraInfo } = req.body;
    await db.execute(
      'UPDATE opinion_universe_surveys SET description = ?, qualification_tips = ?, extra_info = ? WHERE id = ?',
      [description || null, qualificationTips || null, extraInfo || null, id]
    );
    return res.json({ success: true, message: 'Extra info and qualification tips updated successfully!' });
  } catch (err) {
    console.error('Error updating extra info:', err);
    return res.status(500).json({ success: false, error: 'Failed to update extra info: ' + err.message });
  }
}

async function getUserSurveyFeed(req, res) {
  try {
    const rows = await db.query(
      `SELECT id, provider, external_offer_id, title, description, image_url, payout, loi, ir, countries, devices, is_featured, coins_reward, qualification_tips, extra_info
       FROM opinion_universe_surveys WHERE status = 'active'
       ORDER BY is_featured DESC, coins_reward DESC, created_at DESC`
    );
    return res.json({
      success: true,
      surveys: rows.map(s => ({
        id: s.id, provider: s.provider, externalOfferId: s.external_offer_id,
        title: s.title, description: s.description, imageUrl: s.image_url,
        payout: parseFloat(s.payout), loi: s.loi, ir: s.ir,
        countries: s.countries, devices: s.devices,
        isFeatured: s.is_featured === 1, coinsReward: s.coins_reward,
        qualificationTips: s.qualification_tips, extraInfo: s.extra_info
      }))
    });
  } catch (err) {
    console.error('Error fetching survey feed:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch surveys' });
  }
}

async function startSurvey(req, res) {
  try {
    const { surveyId } = req.params;
    const telegramUserId = (req.query.telegramUserId || req.body?.telegramUserId || '1981634693').trim();

    let userRows = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(telegramUserId)]);
    let user;
    if (!userRows.length) {
      try {
        await db.execute(
          'INSERT INTO users (telegram_user_id, username, balance) VALUES (?, ?, 0.00)',
          [String(telegramUserId), 'user_' + telegramUserId]
        );
      } catch (_) {}
      userRows = await db.query('SELECT * FROM users WHERE telegram_user_id = ?', [String(telegramUserId)]);
    }
    user = userRows[0];

    if (!user) return res.status(404).json({ success: false, error: 'User could not be resolved' });
    if (user.status === 'BANNED') return res.status(403).json({ success: false, error: 'Account restricted' });

    // Allow lookup by internal DB id OR external_offer_id
    const surveyRows = await db.query('SELECT * FROM opinion_universe_surveys WHERE id = ? OR external_offer_id = ?', [surveyId, String(surveyId)]);
    if (!surveyRows.length) return res.status(404).json({ success: false, error: 'Survey not found' });
    const survey = surveyRows[0];

    if (survey.status !== 'active') return res.status(400).json({ success: false, error: 'Survey not available' });
    if (!survey.survey_url_template?.includes('{YOUR_CLICK_ID}')) {
      return res.status(500).json({ success: false, error: 'Invalid survey URL template' });
    }

    const clickId = generateClickId(user.id, survey.external_offer_id);
    await db.execute(
      `INSERT INTO survey_clicks (click_id, user_id, survey_id, provider, external_offer_id, status)
       VALUES (?, ?, ?, ?, ?, 'started')`,
      [clickId, user.id, survey.id, survey.provider || 'opinion_universe', survey.external_offer_id]
    );

    const finalUrl = survey.survey_url_template
      .replace(/{YOUR_CLICK_ID}/g, clickId)
      .replace(/{YOUR_SOURCE_ID}/g, OU_SOURCE);

    console.log(`[OU Start Survey] User #${user.id} (${user.telegram_user_id}) -> Survey #${survey.id} (${survey.external_offer_id})`);
    console.log(`[OU Redirect URL] -> ${finalUrl}`);
    return res.redirect(302, finalUrl);
  } catch (err) {
    console.error('Error starting survey:', err);
    return res.status(500).json({ success: false, error: 'Failed to start survey: ' + err.message });
  }
}

async function handlePostback(req, res) {
  const params = { ...req.query, ...req.body };
  const raw = JSON.stringify(params);
  console.log('OU Postback received:', params);

  try {
    const clickId = params.sid || params.sub_id || params.click_id || params.user_id;
    const status = params.status;
    const payout = params.payout; // user reward coins from {PAYOUT}
    const pubPayout = params.pubpayout || params.pub_payout || 0; // publisher USD from {PUBPAYOUT}
    const transId = params.transaction_id || params.TransactionID || params.trans_id;
    const sig = params.sig || params.SIG;

    // Handle "Test Postback Connection" button from Opinion Universe dashboard
    if (!clickId || clickId === '{SID}' || clickId.toLowerCase().includes('cooluser') || clickId.toLowerCase().includes('test')) {
      console.log('[OU Postback] Ping/Test Connection successful. Responding with 1.');
      return res.status(200).send('1');
    }

    // Signature verification (HMAC SHA256 of transactionId with secret token)
    const secret = process.env.OU_POSTBACK_SECRET || '4bb079ad9d6fd601de4183939c1cb201422eef5b2c3e66f00b46b5eaa8ecbafc';
    if (sig && transId && secret) {
      const crypto = require('crypto');
      const calculatedHash = crypto.createHmac('sha256', secret).update(String(transId)).digest('hex');
      if (calculatedHash !== sig) {
        console.warn(`[OU Postback] Signature mismatch! Expected: ${calculatedHash}, Got: ${sig}`);
      }
    }

    const conversionId = transId ? String(transId) : `${clickId}_${Date.now()}`;

    // Prevent duplicate credit
    const existing = await db.query(
      'SELECT id FROM survey_conversions WHERE provider = ? AND conversion_id = ?',
      ['opinion_universe', conversionId]
    );
    if (existing.length > 0) {
      console.log(`[OU Postback] Duplicate conversion ignored: ${conversionId}`);
      return res.status(200).send('1');
    }

    // Lookup click record
    const clickRows = await db.query('SELECT * FROM survey_clicks WHERE click_id = ?', [clickId]);
    if (!clickRows.length) {
      console.warn(`[OU Postback] Click ID not found in database: ${clickId}`);
      return res.status(200).send('1');
    }
    const click = clickRows[0];

    // Lookup user
    const userRows = await db.query('SELECT * FROM users WHERE id = ?', [click.user_id]);
    if (!userRows.length) {
      console.warn(`[OU Postback] User ${click.user_id} not found.`);
      return res.status(200).send('1');
    }
    const user = userRows[0];

    // Lookup survey
    const surveyRows = await db.query('SELECT * FROM opinion_universe_surveys WHERE id = ?', [click.survey_id]);
    const survey = surveyRows[0] || null;

    // USE PAYOUT PARAM EXCLUSIVELY FOR USER PAYMENT
    let rewardCoins = Math.round(parseFloat(payout || 0));
    if (rewardCoins <= 0 && survey?.coins_reward) {
      rewardCoins = survey.coins_reward;
    }
    const providerPayoutVal = parseFloat(pubPayout || survey?.payout || 0);

    // Handle Reversal (status === '2')
    if (String(status) === '2') {
      console.log(`[OU Postback REVERSAL] Reversing conversion for Click ID: ${clickId}`);
      if (rewardCoins > 0 && user) {
        const newBalance = Math.max(0, parseFloat(user.balance || 0) - rewardCoins);
        await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);
        await db.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
           VALUES (?, 'REVERSAL', ?, ?, ?)`,
          [user.id, -rewardCoins, `OU_REV_${conversionId}`, `Opinion Universe Reversal (-${rewardCoins} Coins)`]
        );
      }
      await db.execute(
        `INSERT INTO survey_conversions (provider, conversion_id, click_id, user_id, survey_id, provider_payout, user_reward_coins, status, raw_postback)
         VALUES ('opinion_universe', ?, ?, ?, ?, ?, ?, 'reversal', ?)`,
        [conversionId, clickId, user.id, click.survey_id, providerPayoutVal, -rewardCoins, raw]
      );
      await db.execute('UPDATE survey_clicks SET status = ? WHERE click_id = ?', ['reversed', clickId]);
      return res.status(200).send('1');
    }

    // Status must be 1 for completion
    if (String(status) !== '1') {
      console.log(`[OU Postback] Non-completion status received (${status}). Acknowledging.`);
      return res.status(200).send('1');
    }

    // Credit user balance strictly with rewardCoins from PAYOUT param
    if (rewardCoins > 0) {
      const newBalance = parseFloat(user.balance || 0) + rewardCoins;
      await db.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);
      await db.execute(
        `INSERT INTO wallet_transactions (user_id, type, amount, reference_id, description)
         VALUES (?, 'SURVEY_REWARD', ?, ?, ?)`,
        [user.id, rewardCoins, `OU_${conversionId}`, `Opinion Universe Survey Reward (+${rewardCoins} Coins)`]
      );
    }

    // Insert conversion record
    await db.execute(
      `INSERT INTO survey_conversions (provider, conversion_id, click_id, user_id, survey_id, provider_payout, user_reward_coins, status, raw_postback)
       VALUES ('opinion_universe', ?, ?, ?, ?, ?, ?, 'credited', ?)`,
      [conversionId, clickId, user.id, click.survey_id, providerPayoutVal, rewardCoins, raw]
    );

    // Update click status
    await db.execute('UPDATE survey_clicks SET status = ?, completed_at = NOW() WHERE click_id = ?', ['completed', clickId]);

    console.log(`[OU Postback SUCCESS] Credited +${rewardCoins} coins (from PAYOUT param) to User ${user.id} (${user.telegram_user_id}) | Conv: ${conversionId}`);
    return res.status(200).send('1');
  } catch (err) {
    console.error('Error handling OU postback:', err);
    return res.status(200).send('1');
  }
}

async function getAdminSurveyClicks(req, res) {
  try {
    const rows = await db.query(
      `SELECT 
         sc.id,
         sc.click_id,
         sc.user_id,
         u.name AS user_name,
         u.telegram_user_id,
         sc.external_offer_id,
         sc.survey_id,
         COALESCE(ous.title, CONCAT('Offer #', sc.external_offer_id)) AS survey_title,
         sc.provider,
         sc.status AS click_status,
         sc.created_at AS clicked_at,
         sc.completed_at,
         scv.conversion_id,
         scv.user_reward_coins,
         scv.provider_payout,
         scv.status AS conversion_status,
         scv.created_at AS credited_at,
         CASE 
           WHEN scv.status = 'credited' THEN 'CREDITED'
           WHEN scv.status = 'reversal' THEN 'REVERSED'
           WHEN sc.status = 'completed' THEN 'CREDITED'
           ELSE 'CLICKED'
         END AS display_status
       FROM survey_clicks sc
       LEFT JOIN users u ON sc.user_id = u.id
       LEFT JOIN opinion_universe_surveys ous ON sc.survey_id = ous.id
       LEFT JOIN survey_conversions scv ON sc.click_id = scv.click_id
       ORDER BY sc.created_at DESC LIMIT 500`
    );
    return res.json({ success: true, clicks: rows });
  } catch (err) {
    console.error('Error fetching survey history:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch clicks' });
  }
}

async function getAdminConversions(req, res) {
  try {
    const rows = await db.query(
      `SELECT sc.*, u.name AS user_name, u.telegram_user_id, ous.title AS survey_title
       FROM survey_conversions sc
       LEFT JOIN users u ON sc.user_id = u.id
       LEFT JOIN opinion_universe_surveys ous ON sc.survey_id = ous.id
       ORDER BY sc.created_at DESC LIMIT 500`
    );
    return res.json({ success: true, conversions: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch conversions' });
  }
}

module.exports = {
  fetchLiveOffers, getAdminSurveys, addSurvey, updateSurveyStatus,
  featureSurvey, deleteSurvey, restoreSurvey, permanentDeleteSurvey,
  updateSurveyCoins, updateSurveyExtraInfo, getUserSurveyFeed,
  startSurvey, handlePostback, getAdminSurveyClicks, getAdminConversions
};


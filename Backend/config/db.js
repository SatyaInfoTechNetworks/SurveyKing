const mysql = require('mysql2/promise');
require('dotenv').config();

let mysqlPool = null;

async function initDB() {
  const envHost = process.env.MYSQL_HOST || 'databases-masterdb-ilm2d7';
  const envPort = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const envUser = process.env.MYSQL_USER || 'yellapusatyasai@gmail.com';
  const envPass = process.env.MYSQL_PASSWORD || '@SaiDivya2503';
  const database = process.env.MYSQL_DATABASE || 'surveyking';

  console.log(`====================================================`);
  console.log(`🔌 INITIALIZING SURVEY KING MYSQL CONNECTION ENGINE`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`🎯 Target Database: '${database}'`);
  console.log(`====================================================`);

  const hostsToTry = [
    process.env.MYSQL_HOST,
    '72.61.254.236',
    'databases-masterdb-ilm2d7',
    'localhost'
  ].filter(Boolean);

  const portsToTry = [
    parseInt(process.env.MYSQL_PORT || '3314', 10),
    3314,
    3306
  ];

  const usersToTry = [
    { u: 'yellapusatyasai@gmail.com', p: '@SaiDivya2503' },
    { u: envUser, p: envPass },
    { u: 'root', p: '@SaiDivya2503' }
  ];

  const databaseCandidates = [
    process.env.MYSQL_DATABASE,
    'surveyking'
  ].filter(Boolean);

  let connected = false;

  for (const dbName of databaseCandidates) {
    if (connected) break;
    for (const h of hostsToTry) {
      if (connected) break;
      for (const prt of portsToTry) {
        if (connected) break;
        for (const cred of usersToTry) {
          console.log(`🔄 Attempting MySQL connection -> Host: ${h}:${prt} | User: ${cred.u} | DB: ${dbName}...`);
          try {
            const testPool = mysql.createPool({
              host: h,
              port: prt,
              user: cred.u,
              password: cred.p,
              database: dbName,
              waitForConnections: true,
              connectionLimit: 10,
              connectTimeout: 1200
            });

            const conn = await testPool.getConnection();
            console.log(`====================================================`);
            console.log(`👑 SUCCESS! Connected to MySQL Database '${dbName}'`);
            console.log(`📍 Host: ${h}:${prt} | User: ${cred.u}`);
            console.log(`====================================================`);
            conn.release();

            mysqlPool = testPool;
            activeDbName = dbName;
            connected = true;
            break;
          } catch (err) {
            console.warn(`❌ MySQL candidate failed (${h}:${prt} - ${cred.u} - ${dbName}): ${err.message}`);
          }
        }
      }
    }
  }

  if (!connected) {
    console.error(`====================================================`);
    console.error(`❌ CRITICAL FAILURE: Could not connect to any MySQL host candidate.`);
    console.error(`====================================================`);
    throw new Error(`Failed to connect to MySQL database '${database}'.`);
  }

  await createTables();
}

async function query(sql, params = []) {
  if (!mysqlPool) throw new Error('MySQL Database connection pool is not initialized');
  const [rows] = await mysqlPool.execute(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  if (!mysqlPool) throw new Error('MySQL Database connection pool is not initialized');
  const [result] = await mysqlPool.execute(sql, params);
  return { insertId: result.insertId, affectedRows: result.affectedRows };
}

async function createTables() {
  console.log(`📦 Creating/verifying Survey King table schemas in MySQL database 'surveyking'...`);

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      telegram_user_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(150),
      username VARCHAR(150),
      balance DECIMAL(10, 2) DEFAULT 0.00,
      referral_code VARCHAR(50) UNIQUE NOT NULL,
      referred_by VARCHAR(50) DEFAULT NULL,
      status VARCHAR(30) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      survey_id VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      reward DECIMAL(10, 2) NOT NULL,
      estimated_minutes INT NOT NULL,
      provider VARCHAR(50) DEFAULT 'CPX',
      category VARCHAR(100) DEFAULT 'General',
      icon VARCHAR(50) DEFAULT '🎯',
      active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS survey_participations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      participation_id VARCHAR(100) UNIQUE NOT NULL,
      user_id INT NOT NULL,
      survey_id VARCHAR(100) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      status VARCHAR(30) DEFAULT 'STARTED',
      reward DECIMAL(10, 2) NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME DEFAULT NULL
    ) ENGINE=InnoDB;
  `);

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      reference_id VARCHAR(100) DEFAULT NULL,
      description VARCHAR(255) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      referrer_user_id INT NOT NULL,
      referred_user_id INT NOT NULL,
      referral_code VARCHAR(50) NOT NULL,
      status VARCHAR(30) DEFAULT 'PENDING',
      reward_amount DECIMAL(10, 2) DEFAULT 1000.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      method VARCHAR(50) DEFAULT 'UPI',
      amount DECIMAL(10, 2) NOT NULL,
      upi_id VARCHAR(150) NOT NULL,
      status VARCHAR(30) DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  try { await mysqlPool.execute(`ALTER TABLE withdrawals ADD COLUMN method VARCHAR(50) DEFAULT 'UPI';`); } catch (e) {}

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INT PRIMARY KEY DEFAULT 1,
      referrer_reward_coins INT DEFAULT 1000,
      referee_reward_coins INT DEFAULT 500,
      referral_trigger VARCHAR(50) DEFAULT 'FIRST_SURVEY',
      min_survey_reward_coins INT DEFAULT 100,
      min_withdrawal_coins INT DEFAULT 2500,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  try { await mysqlPool.execute(`ALTER TABLE platform_settings ADD COLUMN min_survey_reward_coins INT DEFAULT 100;`); } catch (e) {}
  try { await mysqlPool.execute(`ALTER TABLE platform_settings ADD COLUMN min_withdrawal_coins INT DEFAULT 2500;`); } catch (e) {}

  // Check if payout_methods has method_id column, recreate if outdated
  try {
    await mysqlPool.execute('SELECT method_id FROM payout_methods LIMIT 1');
  } catch (colErr) {
    console.log('🔄 Rebuilding payout_methods table schema...');
    try {
      await mysqlPool.execute('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlPool.execute('DROP TABLE IF EXISTS payout_tiers');
      await mysqlPool.execute('DROP TABLE IF EXISTS payout_methods');
      await mysqlPool.execute('SET FOREIGN_KEY_CHECKS = 1');
    } catch (dropErr) {
      console.warn('Notice dropping payout tables:', dropErr.message);
    }
  }

  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS payout_methods (
      id INT AUTO_INCREMENT PRIMARY KEY,
      method_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) DEFAULT '💳',
      placeholder VARCHAR(150) DEFAULT 'Enter VPA / Number',
      tiers_json TEXT NOT NULL,
      active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Admin Users & RBAC
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
      name VARCHAR(150) DEFAULT 'Administrator',
      status VARCHAR(30) DEFAULT 'ACTIVE',
      last_login DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Admin Immutable Audit Logs
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_username VARCHAR(100) NOT NULL,
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(100) NOT NULL,
      target_id VARCHAR(100) DEFAULT NULL,
      old_value TEXT DEFAULT NULL,
      new_value TEXT DEFAULT NULL,
      reason VARCHAR(255) DEFAULT '',
      ip VARCHAR(100) DEFAULT '127.0.0.1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Postback Logs & Monitoring
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS postback_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      provider VARCHAR(50) NOT NULL DEFAULT 'CPX',
      trans_id VARCHAR(100) DEFAULT NULL,
      user_id VARCHAR(100) DEFAULT NULL,
      offer_id VARCHAR(100) DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
      raw_status VARCHAR(50) DEFAULT '1',
      amount_local DECIMAL(10, 2) DEFAULT 0.00,
      amount_usd DECIMAL(10, 4) DEFAULT 0.0000,
      hash_valid TINYINT(1) DEFAULT 1,
      idempotency_status VARCHAR(50) DEFAULT 'NEW',
      ip VARCHAR(100) DEFAULT '',
      processing_time_ms INT DEFAULT 0,
      error_reason VARCHAR(255) DEFAULT NULL,
      wallet_credited TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Telegram Notifications Dispatch Ledger
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS telegram_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      telegram_user_id VARCHAR(100) NOT NULL,
      type VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'SENT',
      error_message VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Fraud & Security Risk Flags
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS fraud_flags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      risk_level VARCHAR(30) DEFAULT 'MEDIUM',
      flag_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'OPEN',
      ip VARCHAR(100) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // User advertising IDs
  try { await mysqlPool.execute(`ALTER TABLE users ADD COLUMN google_ad_id VARCHAR(100) DEFAULT NULL;`); } catch (e) {}
  try { await mysqlPool.execute(`ALTER TABLE users ADD COLUMN ios_idfa_id VARCHAR(100) DEFAULT NULL;`); } catch (e) {}

  // Promo Codes & Lifafas Table
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      reward_coins INT NOT NULL,
      max_uses INT DEFAULT 10000,
      current_uses INT DEFAULT 0,
      description VARCHAR(255) DEFAULT '',
      active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // User Promo Code Redemptions Table
  await mysqlPool.execute(`
    CREATE TABLE IF NOT EXISTS promo_redemptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      promo_code_id INT NOT NULL,
      code VARCHAR(50) NOT NULL,
      reward_coins INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_promo (user_id, promo_code_id)
    ) ENGINE=InnoDB;
  `);

  // Surveys extra metadata columns
  try { await mysqlPool.execute(`ALTER TABLE surveys ADD COLUMN priority INT DEFAULT 0;`); } catch (e) {}
  try { await mysqlPool.execute(`ALTER TABLE surveys ADD COLUMN entry_url TEXT DEFAULT NULL;`); } catch (e) {}
  try { await mysqlPool.execute(`ALTER TABLE surveys ADD COLUMN status VARCHAR(30) DEFAULT 'ACTIVE';`); } catch (e) {}
  try { await mysqlPool.execute(`ALTER TABLE surveys ADD COLUMN start_date DATETIME DEFAULT NULL;`); } catch (e) {}
  try { await mysqlPool.execute(`ALTER TABLE surveys ADD COLUMN end_date DATETIME DEFAULT NULL;`); } catch (e) {}

  await seedDefaults();
  console.log(`✅ All MySQL database tables in 'surveyking' verified and ready!`);
}

async function seedDefaults() {
  // 1. Seed Platform Settings if empty
  const settingsRows = await query('SELECT COUNT(*) as cnt FROM platform_settings');
  const sCount = settingsRows[0]?.cnt || settingsRows[0]?.['COUNT(*)'] || 0;
  if (sCount === 0) {
    await execute(
      `INSERT INTO platform_settings (id, referrer_reward_coins, referee_reward_coins, referral_trigger, min_survey_reward_coins) 
       VALUES (1, 1000, 500, 'FIRST_SURVEY', 100)`
    );
    console.log('✅ Default platform referral settings initialized!');
  }

  // 2. Seed Payout Methods & Tiers if empty
  const methodRows = await query('SELECT COUNT(*) as cnt FROM payout_methods');
  const mCount = methodRows[0]?.cnt || methodRows[0]?.['COUNT(*)'] || 0;
  if (mCount === 0) {
    const defaultTiers = JSON.stringify([
      { coins: 2500, rupees: 5 },
      { coins: 5000, rupees: 10 },
      { coins: 10000, rupees: 20 },
      { coins: 25000, rupees: 50 },
      { coins: 50000, rupees: 100 }
    ]);

    const methods = [
      { method_id: 'UPI', name: 'UPI Transfer (VPA)', icon: '⚡', placeholder: 'Enter UPI VPA (e.g. username@paytm)', tiers_json: defaultTiers },
      { method_id: 'BANK', name: 'Bank Transfer (IMPS / NEFT)', icon: '🏦', placeholder: 'Bank Account & IFSC Code', tiers_json: defaultTiers },
      { method_id: 'AMAZON', name: 'Amazon Pay Gift Card', icon: '🎁', placeholder: 'Enter Email or Mobile Number', tiers_json: defaultTiers },
      { method_id: 'PAYTM', name: 'Paytm Wallet Cash', icon: '📲', placeholder: 'Enter Paytm Registered Mobile Number', tiers_json: defaultTiers },
      { method_id: 'GOOGLE_PLAY', name: 'Google Play Gift Code', icon: '🎮', placeholder: 'Enter Email Address for Voucher Code', tiers_json: defaultTiers }
    ];

    for (const m of methods) {
      await execute(
        `INSERT INTO payout_methods (method_id, name, icon, placeholder, tiers_json, active) VALUES (?, ?, ?, ?, ?, 1)`,
        [m.method_id, m.name, m.icon, m.placeholder, m.tiers_json]
      );
    }
    console.log('✅ Default Payout Methods & Tiers initialized!');
  } else {
    // Check if BANK method is missing in existing table
    try {
      const bankExists = await query("SELECT id FROM payout_methods WHERE method_id = 'BANK'");
      if (bankExists.length === 0) {
        const defaultTiers = JSON.stringify([
          { coins: 1000, rupees: 10 },
          { coins: 2500, rupees: 25 },
          { coins: 5000, rupees: 50 },
          { coins: 10000, rupees: 100 }
        ]);
        await execute(
          `INSERT INTO payout_methods (method_id, name, icon, placeholder, tiers_json, active)
           VALUES ('BANK', 'Bank Transfer (IMPS / NEFT)', '🏦', 'Bank Account & IFSC Code', ?, 1)`,
          [defaultTiers]
        );
        console.log('✅ Bank Transfer Payout Method added to existing database!');
      }
    } catch (bErr) {}
  }

  // 3. Seed Super Admin User if empty
  const adminRows = await query('SELECT COUNT(*) as cnt FROM admin_users');
  const aCount = adminRows[0]?.cnt || adminRows[0]?.['COUNT(*)'] || 0;
  if (aCount === 0) {
    await execute(
      `INSERT INTO admin_users (username, password_hash, role, name, status) 
       VALUES ('admin', 'admin123', 'SUPER_ADMIN', 'Super Administrator', 'ACTIVE')`
    );
    await execute(
      `INSERT INTO admin_audit_logs (admin_username, action, target_type, target_id, old_value, new_value, reason, ip)
       VALUES ('SYSTEM', 'SYSTEM_INITIALIZATION', 'PLATFORM', '1', NULL, 'PLATFORM_ACTIVE', 'Survey King Platform Initialization', '127.0.0.1')`
    );
    console.log('✅ Default Super Admin account and Audit Ledger initialized!');
  }

  // 4. Seed Promo Codes / Lifafas if empty
  try {
    const promoRows = await query('SELECT COUNT(*) as cnt FROM promo_codes');
    const pCount = promoRows[0]?.cnt || promoRows[0]?.['COUNT(*)'] || 0;
    if (pCount === 0) {
      const defaultPromos = [
        { code: 'SURVEYKING', reward: 500, max: 10000, desc: 'Official Survey King Launch Bonus' },
        { code: 'SATYA100', reward: 100, max: 10000, desc: 'Satya InfoTech Networks Special Bonus' },
        { code: 'DEVRAJ069', reward: 250, max: 5000, desc: 'Devraj069 Special Community Lifafa' },
        { code: 'WELCOME1000', reward: 1000, max: 2000, desc: 'Grand Welcome Lifafa Promo' },
        { code: 'LIFAFA2026', reward: 300, max: 5000, desc: 'Exclusive Telegram Community Lifafa' }
      ];
      for (const p of defaultPromos) {
        await execute(
          `INSERT IGNORE INTO promo_codes (code, reward_coins, max_uses, current_uses, description, active)
           VALUES (?, ?, ?, 0, ?, 1)`,
          [p.code, p.reward, p.max, p.desc]
        );
      }
      console.log('✅ Default Promo Codes / Lifafas initialized!');
    }
  } catch (pErr) {
    console.warn('Notice seeding promo codes:', pErr.message);
  }
}

function getMode() {
  return 'MYSQL';
}

function getActiveDbName() {
  return 'surveyking';
}

module.exports = {
  initDB,
  query,
  execute,
  getMode,
  getActiveDbName
};

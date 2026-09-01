const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

let dbMode = 'MYSQL';
let mysqlPool = null;
let sqliteDb = null;
let activeDbName = 'surveyking';

async function initDB() {
  const host = process.env.MYSQL_HOST || '72.61.254.236';
  const port = parseInt(process.env.MYSQL_PORT || '3314', 10);
  const user = process.env.MYSQL_USER || 'yellapusatyasai@gmail.com';
  const password = process.env.MYSQL_PASSWORD || '@SaiDivya2503';

  console.log(`🔌 Initializing Survey King MySQL Database connection...`);

  // Try MySQL Connection Candidates
  const hostsToTry = [
    process.env.MYSQL_HOST,
    '72.61.254.236',
    '172.17.0.1',
    'host.docker.internal',
    'localhost'
  ].filter(Boolean);

  const targetDbName = process.env.MYSQL_DATABASE || 'surveyking';

  for (const h of hostsToTry) {
    try {
      const dbPort = h === 'localhost' ? 3306 : port;
      const dbUser = h === 'localhost' ? 'root' : user;
      const dbPass = h === 'localhost' ? 'root' : password;

      // Ensure database 'surveyking' exists
      try {
        const rootConn = await mysql.createConnection({
          host: h,
          port: dbPort,
          user: dbUser,
          password: dbPass
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\`;`);
        await rootConn.end();
      } catch (createDbErr) {
        // If no CREATE DATABASE permission, connect directly to targetDbName
      }

      const testPool = mysql.createPool({
        host: h,
        port: dbPort,
        user: dbUser,
        password: dbPass,
        database: targetDbName,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 3000
      });

      const conn = await testPool.getConnection();
      console.log(`👑 Connected to MySQL Database '${targetDbName}' at ${h}:${dbPort}!`);
      conn.release();

      mysqlPool = testPool;
      dbMode = 'MYSQL';
      activeDbName = targetDbName;
      connected = true;
      break;
    } catch (err) {
      // Try next host candidate
    }
  }

  if (!connected) {
    console.log('🔄 Falling back to embedded SQLite database for local reliability...');
    dbMode = 'SQLITE';
    activeDbName = 'survey_king.sqlite';
    const dbPath = path.join(__dirname, '..', 'survey_king.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
  }

  await createTables();
}

async function query(sql, params = []) {
  if (dbMode === 'MYSQL') {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

async function execute(sql, params = []) {
  if (dbMode === 'MYSQL') {
    const [result] = await mysqlPool.execute(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ insertId: this.lastID, affectedRows: this.changes });
      });
    });
  }
}

async function createTables() {
  console.log(`📦 Setting up Survey King schema & tables in '${activeDbName}'...`);

  if (dbMode === 'MYSQL') {
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

    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INT PRIMARY KEY DEFAULT 1,
        referrer_reward_coins INT DEFAULT 1000,
        referee_reward_coins INT DEFAULT 500,
        referral_trigger VARCHAR(50) DEFAULT 'FIRST_SURVEY',
        min_survey_reward_coins INT DEFAULT 100,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

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

  } else {
    const runAsync = (sql) => new Promise((res, rej) => sqliteDb.run(sql, (err) => err ? rej(err) : res()));

    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_user_id TEXT UNIQUE NOT NULL,
        name TEXT,
        username TEXT,
        balance REAL DEFAULT 0.00,
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT DEFAULT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        reward REAL NOT NULL,
        estimated_minutes INTEGER NOT NULL,
        provider TEXT DEFAULT 'CPX',
        category TEXT DEFAULT 'General',
        icon TEXT DEFAULT '🎯',
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS survey_participations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participation_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        survey_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT DEFAULT 'STARTED',
        reward REAL NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME DEFAULT NULL
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        reference_id TEXT DEFAULT NULL,
        description TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_user_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        referral_code TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        reward_amount REAL DEFAULT 1000.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        method TEXT DEFAULT 'UPI',
        amount REAL NOT NULL,
        upi_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        referrer_reward_coins INTEGER DEFAULT 1000,
        referee_reward_coins INTEGER DEFAULT 500,
        referral_trigger TEXT DEFAULT 'FIRST_SURVEY',
        min_survey_reward_coins INTEGER DEFAULT 100,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS payout_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        icon TEXT DEFAULT '💳',
        placeholder TEXT DEFAULT 'Enter VPA / Number',
        tiers_json TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  await seedDefaults();
  console.log(`✅ All database tables in '${activeDbName}' created and ready!`);
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
  }
}

function getMode() {
  return dbMode;
}

function getActiveDbName() {
  return activeDbName;
}

module.exports = {
  initDB,
  query,
  execute,
  getMode,
  getActiveDbName
};

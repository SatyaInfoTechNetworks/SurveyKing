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
  const targetDb = process.env.MYSQL_DATABASE || 'surveyking';

  console.log(`🔌 Initializing Survey King MySQL Database connection...`);

  // Option A: Try Local MySQL with database 'surveyking'
  try {
    const localConn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root'
    });
    await localConn.query(`CREATE DATABASE IF NOT EXISTS \`surveyking\`;`);
    await localConn.end();

    mysqlPool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'surveyking',
      waitForConnections: true,
      connectionLimit: 10
    });

    const conn = await mysqlPool.getConnection();
    console.log(`👑 Connected to MySQL Database 'surveyking' on localhost:3306!`);
    conn.release();
    dbMode = 'MYSQL';
    activeDbName = 'surveyking';
  } catch (localErr) {
    console.log(`ℹ️ Local MySQL unavailable (${localErr.message}). Connecting to Remote Hostinger MySQL...`);

    // Option B: Try Remote MySQL Database
    try {
      // First try database 'surveyking'
      mysqlPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database: 'surveyking',
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 8000
      });
      const conn = await mysqlPool.getConnection();
      console.log(`👑 Connected to Remote MySQL Database 'surveyking' at ${host}:${port}!`);
      conn.release();
      dbMode = 'MYSQL';
      activeDbName = 'surveyking';
    } catch (remoteSurveyKingErr) {
      console.log(`ℹ️ Remote database 'surveyking' restricted. Connecting to Remote MySQL 'primary_db'...`);
      try {
        mysqlPool = mysql.createPool({
          host,
          port,
          user,
          password,
          database: 'primary_db',
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 8000
        });
        const conn = await mysqlPool.getConnection();
        console.log(`👑 Connected to Remote MySQL Database 'primary_db' at ${host}:${port}!`);
        conn.release();
        dbMode = 'MYSQL';
        activeDbName = 'primary_db';
      } catch (remotePrimaryErr) {
        console.warn(`⚠️ Could not connect to remote MySQL:`, remotePrimaryErr.message);
        console.log('🔄 Falling back to embedded SQLite database for local reliability...');

        dbMode = 'SQLITE';
        activeDbName = 'survey_king.sqlite';
        const dbPath = path.join(__dirname, '..', 'survey_king.sqlite');
        sqliteDb = new sqlite3.Database(dbPath);
        console.log(`✅ Connected to SQLite database at ${dbPath}`);
      }
    }
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
        reward_amount DECIMAL(10, 2) DEFAULT 1500.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        upi_id VARCHAR(150) NOT NULL,
        status VARCHAR(30) DEFAULT 'PENDING',
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
        reward_amount REAL DEFAULT 15.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        upi_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  await seedSurveys();
  console.log(`✅ All database tables in '${activeDbName}' created and ready!`);
}

async function seedSurveys() {
  // Update existing surveys to coins format if needed
  await execute(`UPDATE surveys SET reward = 4000 WHERE survey_id = 'S101' AND reward <= 100`);
  await execute(`UPDATE surveys SET reward = 6500 WHERE survey_id = 'S102' AND reward <= 100`);
  await execute(`UPDATE surveys SET reward = 3000 WHERE survey_id = 'S103' AND reward <= 100`);
  await execute(`UPDATE surveys SET reward = 9000 WHERE survey_id = 'S104' AND reward <= 100`);
  await execute(`UPDATE surveys SET reward = 5000 WHERE survey_id = 'S105' AND reward <= 100`);
  await execute(`UPDATE surveys SET reward = 12000 WHERE survey_id = 'S106' AND reward <= 100`);

  const existing = await query(`SELECT COUNT(*) as cnt FROM surveys`);
  const count = existing[0]?.cnt || existing[0]?.['COUNT(*)'] || 0;

  if (count === 0) {
    console.log(`🌱 Seeding default surveys into '${activeDbName}'...`);
    const defaultSurveys = [
      { survey_id: 'S101', title: 'Google Consumer Pulse', reward: 4000, estimated_minutes: 5, provider: 'Google', category: 'Technology', icon: '🔍' },
      { survey_id: 'S102', title: 'Global Brand & Shopping Study', reward: 6500, estimated_minutes: 8, provider: 'CPX Research', category: 'Shopping', icon: '🛍️' },
      { survey_id: 'S103', title: 'Food & Dining Preference Survey', reward: 3000, estimated_minutes: 4, provider: 'BitLabs', category: 'Lifestyle', icon: '🍔' },
      { survey_id: 'S104', title: 'Tech Gadgets & Smartphone Feedback', reward: 9000, estimated_minutes: 12, provider: 'CPX Research', category: 'Gadgets', icon: '📱' },
      { survey_id: 'S105', title: 'Streaming & OTT Habits 2026', reward: 5000, estimated_minutes: 6, provider: 'InBrain', category: 'Entertainment', icon: '🎬' },
      { survey_id: 'S106', title: 'Financial & UPI Apps Satisfaction', reward: 12000, estimated_minutes: 15, provider: 'TheoremReach', category: 'Finance', icon: '💳' }
    ];

    for (const s of defaultSurveys) {
      await execute(
        `INSERT INTO surveys (survey_id, title, reward, estimated_minutes, provider, category, icon, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [s.survey_id, s.title, s.reward, s.estimated_minutes, s.provider, s.category, s.icon]
      );
    }
    console.log(`✅ Default surveys seeded successfully into '${activeDbName}'!`);
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

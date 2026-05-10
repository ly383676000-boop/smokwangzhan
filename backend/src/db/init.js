const initSQL = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  brand TEXT,
  description TEXT,
  description_en TEXT,
  price REAL NOT NULL,
  images TEXT,
  category TEXT,
  variant_options TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT,
  customer_postal_code TEXT,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  variant_info TEXT,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Default company settings
const DEFAULT_SETTINGS = {
  company_name: 'HONG KONG COOKIES TRADING LIMITED',
  company_name_zh: '香港曲奇贸易有限公司',
  whatsapp: '+852 1234 5678',
  email: 'info@hkcookies.com',
  address: 'Hong Kong SAR',
  phone: '+852 1234 5678',
  admin_password: 'smok2024',
};

// Migration: add variant_options column if it doesn't exist (for existing DBs)
// Migration: add box_qty column if it doesn't exist
// Migration: ensure settings table has default values
// Migration: create admin_users table and seed default admin
function migrateDB(db) {
  try {
    // Add admin_users table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'editor',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin_users table has is_active column
    try {
      const userCols = db.exec("SELECT name FROM pragma_table_info('admin_users')");
      if (userCols.length > 0) {
        const existingUserCols = userCols[0].values.map(v => v[0]);
        if (!existingUserCols.includes('is_active')) {
          db.run("ALTER TABLE admin_users ADD COLUMN is_active INTEGER DEFAULT 1");
          console.log('Migration: added is_active column to admin_users');
        }
      }
    } catch (e) { /* table might not exist */ }

    const cols = db.exec("PRAGMA table_info(products)");
    if (cols.length > 0) {
      const rows = db.exec("SELECT name FROM pragma_table_info('products')");
      if (rows.length > 0) {
        const existingCols = rows[0].values.map(v => v[0]);
        if (!existingCols.includes('variant_options')) {
          db.run("ALTER TABLE products ADD COLUMN variant_options TEXT");
          console.log('Migration: added variant_options column to products');
        }
        if (!existingCols.includes('box_qty')) {
          db.run("ALTER TABLE products ADD COLUMN box_qty INTEGER NOT NULL DEFAULT 1");
          console.log('Migration: added box_qty column to products (default 1)');
        }
      }
    }

    // Ensure settings have defaults
    const settingsKeys = Object.keys(DEFAULT_SETTINGS);
    for (const key of settingsKeys) {
      const existing = db.exec(`SELECT value FROM settings WHERE key = '${key}'`);
      if (existing.length === 0 || existing[0].values.length === 0) {
        db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, DEFAULT_SETTINGS[key]]);
        console.log(`Settings initialized: ${key}`);
      }
    }

    // Seed default admin user if no users exist
    const userCount = db.exec("SELECT COUNT(*) as cnt FROM admin_users");
    if (userCount.length === 0 || userCount[0].values[0][0] === 0) {
      const crypto = require('crypto');
      // Default password: smok2024
      const defaultHash = crypto.createHash('sha256').update('smok2024').digest('hex');
      db.run("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)",
        ['admin', defaultHash, 'admin']);
      console.log('Default admin user created: admin / smok2024');
    }
  } catch (e) {
    console.log('Migration check skipped:', e.message);
  }
}

const fs = require('fs');
const path = require('path');

let db = null;

/**
 * Initialize the database.
 * Returns a Promise that resolves when the DB is ready.
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const initSqlJs = require('sql.js');

    initSqlJs().then(SQL => {
      const dbPath = path.join(__dirname, 'database.sqlite');

      if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('Database loaded from file.');
        db.run(initSQL);
        migrateDB(db);
      } else {
        db = new SQL.Database();
        db.run(initSQL);
        migrateDB(db);
        console.log('New database created and schema initialized.');
      }

      // Auto-save every 5 seconds
      setInterval(() => {
        if (db) {
          try {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbPath, buffer);
          } catch (e) {
            console.error('Auto-save failed:', e);
          }
        }
      }, 5000);

      resolve(db);
    }).catch(err => {
      console.error('Failed to initialize sql.js:', err);
      reject(err);
    });
  });
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized yet. Make sure initDB() has completed before handling requests.');
  }
  return db;
}

/** Run a SELECT and return array of row objects */
function runQuery(sql, params = []) {
  const database = getDB();
  try {
    const stmt = database.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results = [];
    while (true) {
      const result = stmt.step();
      if (result === false || result === undefined || (typeof result === 'object' && !result)) {
        break;
      }
      const row = stmt.getAsObject();
      if (row) {
        results.push(row);
      }
    }
    stmt.free();
    return results;
  } catch (err) {
    console.error('Query error:', err, '\nSQL:', sql);
    throw err;
  }
}

/** Run an INSERT and return the new row id */
function runInsert(sql, params = []) {
  const database = getDB();
  try {
    database.run(sql, params);
    return database.exec('SELECT last_insert_rowid()')[0].values[0][0];
  } catch (err) {
    console.error('Insert error:', err, '\nSQL:', sql);
    throw err;
  }
}

/** Manually persist DB to disk (called on graceful shutdown etc.) */
function saveDB() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path.join(__dirname, 'database.sqlite'), buffer);
    console.log('Database saved.');
  } catch (e) {
    console.error('saveDB failed:', e);
  }
}

module.exports = { initDB, getDB, runQuery, runInsert, saveDB };

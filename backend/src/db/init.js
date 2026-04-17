const initSQL = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  brand TEXT,
  description TEXT,
  description_en TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category TEXT,
  -- Variant option fields (available choices)
  colors TEXT,
  sizes TEXT,
  specifications TEXT,
  materials TEXT,
  custom1_name TEXT,
  custom1_values TEXT,
  custom2_name TEXT,
  custom2_values TEXT,
  custom3_name TEXT,
  custom3_values TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  color TEXT,
  size TEXT,
  specification TEXT,
  material TEXT,
  custom_param1_name TEXT,
  custom_param1_value TEXT,
  custom_param2_name TEXT,
  custom_param2_value TEXT,
  custom_param3_name TEXT,
  custom_param3_value TEXT,
  notes TEXT,
  price_modifier REAL DEFAULT 0,
  stock INTEGER DEFAULT 100,
  image_url TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id)
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
  variant_sku TEXT NOT NULL,
  color TEXT,
  size TEXT,
  specification TEXT,
  material TEXT,
  custom_params TEXT,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

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
      } else {
        db = new SQL.Database();
        db.run(initSQL);
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
    while (stmt.step()) {
      results.push(stmt.getAsObject());
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

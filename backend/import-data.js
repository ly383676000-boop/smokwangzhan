/**
 * 直接导入 data/ 目录下的 JSON 数据到 SQLite 数据库
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(__dirname, 'src', 'db', 'database.sqlite');

// 初始化 SQL
const INIT_SQL = `
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
`;

async function seed() {
  const SQL = await initSqlJs();

  // 加载或创建数据库
  let db;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('Loaded existing database');
  } else {
    db = new SQL.Database();
    db.run(INIT_SQL);
    console.log('Created new database with schema');
  }

  // 读取产品数据
  const productsFile = path.join(DATA_DIR, 'products.json');

  if (!fs.existsSync(productsFile)) {
    console.error('No products.json found in data/');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  console.log(`Importing ${products.length} products...`);

  // 清空旧数据
  db.run('DELETE FROM order_items');
  db.run('DELETE FROM orders');
  db.run('DELETE FROM products');

  // 插入产品
  let inserted = 0;
  for (const p of products) {
    try {
      const images = p.image ? JSON.stringify([p.image]) : null;
      db.run(
        `INSERT INTO products (name, name_en, brand, description, description_en, price, images, category, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name || p.name_zh || '',
          p.name_en || p.name || '',
          p.brand || '',
          p.description || '',
          p.description_en || p.description || '',
          p.price || 0,
          images,
          p.category || '',
          p.created_at || new Date().toISOString(),
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`Failed to insert product ${p.id}: ${err.message}`);
    }
  }
  console.log(`Inserted ${inserted}/${products.length} products`);

  // 保存数据库
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log(`\n✅ Database saved to ${DB_PATH}`);
  console.log(`   Products: ${inserted}`);

  db.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

/**
 * 直接导入 data/ 目录下的 JSON 数据到 SQLite 数据库
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(__dirname, 'src', 'db', 'database.sqlite');

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
    console.log('Created new database');
  }

  // 读取产品数据
  const productsFile = path.join(DATA_DIR, 'products.json');
  const variantsFile = path.join(DATA_DIR, 'variants.json');

  if (!fs.existsSync(productsFile)) {
    console.error('No products.json found in data/');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  const variants = fs.existsSync(variantsFile)
    ? JSON.parse(fs.readFileSync(variantsFile, 'utf8'))
    : [];

  console.log(`Importing ${products.length} products and ${variants.length} variants...`);

  // 清空旧数据
  db.run('DELETE FROM product_variants');
  db.run('DELETE FROM products');

  // 插入产品
  let inserted = 0;
  for (const p of products) {
    try {
      db.run(
        `INSERT INTO products (id, name, name_en, brand, description, description_en, price, image_url, category, 
          colors, sizes, specifications, materials, custom1_name, custom1_values, custom2_name, custom2_values, custom3_name, custom3_values, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.name || p.name_zh || '',
          p.name_en || p.name || '',
          p.brand || '',
          p.description || '',
          p.description_en || p.description || '',
          p.price || 0,
          p.image || p.image_url || '',
          p.category || '',
          p.colors || '',
          p.sizes || '',
          p.specifications || '',
          p.materials || '',
          p.custom1_name || '',
          p.custom1_values || '',
          p.custom2_name || '',
          p.custom2_values || '',
          p.custom3_name || '',
          p.custom3_values || '',
          p.created_at || new Date().toISOString(),
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`Failed to insert product ${p.id}: ${err.message}`);
    }
  }
  console.log(`Inserted ${inserted}/${products.length} products`);

  // 插入变体
  let varInserted = 0;
  for (const v of variants) {
    try {
      db.run(
        `INSERT INTO product_variants (id, product_id, sku, color, size, specification, material, 
          custom_param1_name, custom_param1_value, custom_param2_name, custom_param2_value, 
          custom_param3_name, custom_param3_value, notes, price_modifier, stock, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          v.id,
          v.product_id,
          v.sku || `SKU-${v.product_id}-${v.id}`,
          v.color || '',
          v.size || '',
          v.specification || '',
          v.material || '',
          v.custom_param1_name || '',
          v.custom_param1_value || '',
          v.custom_param2_name || '',
          v.custom_param2_value || '',
          v.custom_param3_name || '',
          v.custom_param3_value || '',
          v.notes || '',
          v.price_modifier || 0,
          v.stock || 100,
          v.image_url || '',
        ]
      );
      varInserted++;
    } catch (err) {
      console.error(`Failed to insert variant ${v.id}: ${err.message}`);
    }
  }
  console.log(`Inserted ${varInserted}/${variants.length} variants`);

  // 保存数据库
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log(`\n✅ Database saved to ${DB_PATH}`);
  console.log(`   Products: ${inserted}, Variants: ${varInserted}`);

  db.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

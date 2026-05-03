/**
 * Seed API - Initialize product data on first call.
 * POST /api/seed - batch import products and variants.
 * Requires admin JWT authentication.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'smok-shop-jwt-secret-2024';
const DATA_DIR = path.join(process.cwd(), 'data');

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

function body(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function verifyJWT(token) {
  try {
    const [header, b, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${b}`).digest('base64url');
    if (signature !== expected) return null;
    return JSON.parse(Buffer.from(b, 'base64url').toString());
  } catch {
    return null;
  }
}

function getAdmin(req) {
  const auth = (req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) {
    const payload = verifyJWT(auth.slice(7));
    if (payload && payload.exp > Math.floor(Date.now() / 1000) && payload.role === 'admin') {
      return payload;
    }
  }
  return null;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, {});

  const admin = getAdmin(req);
  if (!admin) return json(res, 401, { error: 'Admin authentication required' });

  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  try {
    const data = await body(req);
    const { products, variants, append } = data;

    if (!products || !Array.isArray(products)) {
      return json(res, 400, { error: 'products array required' });
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let existingProducts = [];
    let existingVariants = [];
    const productsFile = path.join(DATA_DIR, 'products.json');
    const variantsFile = path.join(DATA_DIR, 'variants.json');

    if (append) {
      try { existingProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8')); } catch {}
      try { existingVariants = JSON.parse(fs.readFileSync(variantsFile, 'utf8')); } catch {}
    }

    const maxId = existingProducts.length > 0
      ? Math.max(...existingProducts.map(p => p.id || 0))
      : 0;
    const maxVarId = existingVariants.length > 0
      ? Math.max(...existingVariants.map(v => v.id || 0))
      : 0;

    // Remap IDs if needed
    const newProducts = products.map((p, i) => ({
      ...p,
      id: maxId + i + 1,
    }));
    const newVariants = (variants || []).map((v, i) => ({
      ...v,
      id: maxVarId + i + 1,
      product_id: maxId + (v.product_id || 1),
    }));

    const allProducts = append ? [...existingProducts, ...newProducts] : newProducts;
    const allVariants = append ? [...existingVariants, ...newVariants] : newVariants;

    fs.writeFileSync(productsFile, JSON.stringify(allProducts, null, 2));
    if (variants && variants.length > 0) {
      fs.writeFileSync(variantsFile, JSON.stringify(allVariants, null, 2));
    }

    return json(res, 200, {
      message: `Seeded ${newProducts.length} products, ${newVariants.length} variants`,
      total_products: allProducts.length,
      total_variants: allVariants.length,
    });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};

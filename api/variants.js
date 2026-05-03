const store = require('./store');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'smok-shop-jwt-secret-2024';

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
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

  const parts = new URL(req.url, 'http://x').pathname.split('/').filter(Boolean);

  try {
    // GET variants is public
    if (req.method === 'GET') {
      const productId = parts[2];
      if (productId) return json(res, 200, store.queryVariants(productId));
      return json(res, 400, { error: 'Product ID required' });
    }

    // All mutations require admin
    const admin = getAdmin(req);
    if (!admin) return json(res, 401, { error: 'Admin authentication required' });

    if (req.method === 'POST') {
      const b = await body(req);
      if (b.variants && Array.isArray(b.variants)) {
        // Batch insert
        const created = store.batchInsertVariants(b.product_id, b.variants);
        return json(res, 200, { created, message: `${created.length} variants created` });
      }
      if (!b.product_id) return json(res, 400, { error: 'Product ID required' });
      return json(res, 200, { id: store.insertVariant(b), message: 'Variant created' });
    }
    if (req.method === 'PUT') {
      const b = await body(req);
      const ok = store.updateVariant(parts[2], b);
      if (!ok) return json(res, 404, { error: 'Variant not found' });
      return json(res, 200, { message: 'Variant updated' });
    }
    if (req.method === 'DELETE') {
      store.deleteVariant(parts[2]);
      return json(res, 200, { message: 'Variant deleted' });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};

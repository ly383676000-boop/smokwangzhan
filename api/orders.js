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
    // POST (create order) is public
    if (req.method === 'POST') {
      const b = await body(req);
      if (!b.customer_name || !b.customer_address || !b.items?.length)
        return json(res, 400, { error: 'Customer info and items required' });
      const r = store.insertOrder(b);
      return json(res, 200, { order_id: r.order_id, order_number: r.order_number, message: 'Order created' });
    }

    // GET orders require admin auth
    if (req.method === 'GET') {
      const admin = getAdmin(req);
      if (!admin) return json(res, 401, { error: 'Admin authentication required' });

      if (parts.length <= 2) return json(res, 200, store.queryOrders());
      const o = store.queryOrder(parts[2]);
      if (!o) return json(res, 404, { error: 'Order not found' });
      return json(res, 200, o);
    }

    // PUT (update order status) requires admin
    if (req.method === 'PUT') {
      const admin = getAdmin(req);
      if (!admin) return json(res, 401, { error: 'Admin authentication required' });

      const b = await body(req);
      const fs = require('fs');
      const path = require('path');
      const DATA_DIR = path.join(process.cwd(), 'data');
      const ordersFile = path.join(DATA_DIR, 'orders.json');
      let orders = [];
      try { orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8')); } catch {}
      const idx = orders.findIndex(o => o.id === Number(parts[2]));
      if (idx === -1) return json(res, 404, { error: 'Order not found' });
      if (b.status) orders[idx].status = b.status;
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
      return json(res, 200, { message: 'Order updated' });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};

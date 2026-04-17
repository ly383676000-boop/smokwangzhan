const store = require('./store');

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, {});

  const parts = new URL(req.url, 'http://x').pathname.split('/').filter(Boolean);

  try {
    if (req.method === 'POST') {
      const b = await body(req);
      if (!b.customer_name || !b.customer_address || !b.items?.length)
        return json(res, 400, { error: 'Customer info and items required' });
      const r = store.insertOrder(b);
      return json(res, 200, { order_id: r.order_id, order_number: r.order_number, message: 'Order created' });
    }
    if (req.method === 'GET') {
      if (parts.length <= 2) return json(res, 200, store.queryOrders());
      const o = store.queryOrder(parts[2]);
      if (!o) return json(res, 404, { error: 'Order not found' });
      return json(res, 200, o);
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};

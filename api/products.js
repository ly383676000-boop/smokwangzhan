const store = require('./store');

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
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
  // /api/products or /api/products/:id

  try {
    if (req.method === 'GET') {
      if (parts.length <= 2) return json(res, 200, store.queryProducts());
      const p = store.queryProduct(parts[2]);
      if (!p) return json(res, 404, { error: 'Product not found' });
      return json(res, 200, p);
    }
    if (req.method === 'POST') {
      const b = await body(req);
      if (!b.name || !b.price) return json(res, 400, { error: 'Name and price are required' });
      return json(res, 200, { id: store.insertProduct(b), message: 'Product created' });
    }
    if (req.method === 'PUT') {
      const b = await body(req);
      const ok = store.updateProduct(parts[2], b);
      if (!ok) return json(res, 404, { error: 'Product not found' });
      return json(res, 200, { message: 'Product updated' });
    }
    if (req.method === 'DELETE') {
      store.deleteProduct(parts[2]);
      return json(res, 200, { message: 'Product deleted' });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};

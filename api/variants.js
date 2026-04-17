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

  const url = new URL(req.url, 'http://x');
  const parts = url.pathname.split('/').filter(Boolean);
  // /api/variants, /api/variants/product/:id, /api/variants/batch, /api/variants/:id

  try {
    // GET /api/variants/product/:productId
    if (req.method === 'GET' && parts[3] === 'product') {
      return json(res, 200, store.queryVariants(parts[4]));
    }

    // POST /api/variants/batch
    if (req.method === 'POST' && parts[3] === 'batch') {
      const b = await body(req);
      if (!b.product_id || !Array.isArray(b.variants))
        return json(res, 400, { error: 'Product ID and variants array required' });
      const created = store.batchInsertVariants(b.product_id, b.variants);
      return json(res, 200, { message: `${created.length} variants created`, variants: created });
    }

    // POST /api/variants/generate-combinations
    if (req.method === 'POST' && parts[3] === 'generate-combinations') {
      const b = await body(req);
      const { prefix = '', colors = [], sizes = [], specifications = [], materials = [], custom1 = {}, custom2 = {}, custom3 = {} } = b;
      const combos = [];
      for (const c of colors) for (const s of sizes) for (const sp of specifications) for (const m of materials) {
        const p = [prefix, c, s, sp, m];
        if (custom1.value) p.push(custom1.value);
        if (custom2.value) p.push(custom2.value);
        if (custom3.value) p.push(custom3.value);
        combos.push({ sku: p.join('-').toUpperCase(), color: c, size: s, specification: sp, material: m,
          custom_param1_name: custom1.name || null, custom_param1_value: custom1.value || null,
          custom_param2_name: custom2.name || null, custom_param2_value: custom2.value || null,
          custom_param3_name: custom3.name || null, custom_param3_value: custom3.value || null });
      }
      return json(res, 200, { count: combos.length, combinations: combos });
    }

    // POST /api/variants
    if (req.method === 'POST') {
      const b = await body(req);
      if (!b.product_id || !b.sku) return json(res, 400, { error: 'Product ID and SKU required' });
      return json(res, 200, { id: store.insertVariant(b), message: 'Variant created' });
    }

    // PUT /api/variants/:id
    if (req.method === 'PUT') {
      const b = await body(req);
      const ok = store.updateVariant(parts[3], b);
      if (!ok) return json(res, 404, { error: 'Variant not found' });
      return json(res, 200, { message: 'Variant updated' });
    }

    // DELETE /api/variants/:id
    if (req.method === 'DELETE') {
      store.deleteVariant(parts[3]);
      return json(res, 200, { message: 'Variant deleted' });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};

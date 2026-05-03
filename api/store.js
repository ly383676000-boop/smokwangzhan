/**
 * JSON-based database store for Vercel Serverless.
 * Shared by all API functions.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return [];
}

function writeJSON(filename, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
  }
}

function getNextId(items) {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

// --- Products ---
function queryProducts() {
  const products = readJSON('products.json');
  const variants = readJSON('variants.json');
  return products.map(p => {
    const pVariants = variants.filter(v => v.product_id === p.id);
    return {
      ...p,
      variant_count: pVariants.length,
      colors: [...new Set(pVariants.filter(v => v.color).map(v => v.color))].join(','),
    };
  }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function queryProduct(id) {
  const products = readJSON('products.json');
  const product = products.find(p => p.id === Number(id));
  if (!product) return null;
  const variants = readJSON('variants.json').filter(v => v.product_id === product.id);
  return { ...product, variants };
}

function insertProduct(data) {
  const products = readJSON('products.json');
  const id = getNextId(products);
  products.push({
    id, ...data,
    price: Number(data.price) || 0,
    created_at: new Date().toISOString(),
  });
  writeJSON('products.json', products);
  return id;
}

function updateProduct(id, data) {
  const products = readJSON('products.json');
  const idx = products.findIndex(p => p.id === Number(id));
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...data };
  writeJSON('products.json', products);
  return true;
}

function deleteProduct(id) {
  let products = readJSON('products.json');
  let variants = readJSON('variants.json');
  products = products.filter(p => p.id !== Number(id));
  variants = variants.filter(v => v.product_id !== Number(id));
  writeJSON('products.json', products);
  writeJSON('variants.json', variants);
  return true;
}

// --- Variants ---
function queryVariants(productId) {
  return readJSON('variants.json').filter(v => v.product_id === Number(productId));
}

function insertVariant(data) {
  const variants = readJSON('variants.json');
  const id = getNextId(variants);
  variants.push({
    id, ...data,
    product_id: Number(data.product_id),
    price_modifier: Number(data.price_modifier) || 0,
    stock: Number(data.stock) || 100,
  });
  writeJSON('variants.json', variants);
  return id;
}

function batchInsertVariants(productId, variantList) {
  const created = [];
  for (const v of variantList) {
    const id = insertVariant({ ...v, product_id: productId });
    created.push({ id, sku: v.sku });
  }
  return created;
}

function updateVariant(id, data) {
  const variants = readJSON('variants.json');
  const idx = variants.findIndex(v => v.id === Number(id));
  if (idx === -1) return false;
  variants[idx] = { ...variants[idx], ...data };
  writeJSON('variants.json', variants);
  return true;
}

function deleteVariant(id) {
  const variants = readJSON('variants.json');
  writeJSON('variants.json', variants.filter(v => v.id !== Number(id)));
  return true;
}

// --- Orders ---
function insertOrder(data) {
  const orders = readJSON('orders.json');
  const orderItems = readJSON('order_items.json');
  const id = getNextId(orders);
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const now = new Date().toISOString();

  const order = {
    id, order_number: orderNumber,
    customer_name: data.customer_name || '',
    customer_address: data.customer_address || '',
    customer_phone: data.customer_phone || '',
    total_amount: Number(data.total_amount) || 0,
    status: 'pending',
    created_at: now,
  };
  orders.push(order);

  for (const item of (data.items || [])) {
    const itemId = getNextId(orderItems);
    orderItems.push({
      id: itemId,
      order_id: id,
      product_name: item.product_name || '',
      variant_sku: item.variant_sku || '',
      color: item.color || null,
      size: item.size || null,
      specification: item.specification || null,
      material: item.material || null,
      custom_params: JSON.stringify({
        custom1: item.custom_param1 || '',
        custom2: item.custom_param2 || '',
        custom3: item.custom_param3 || '',
        notes: item.notes || '',
      }),
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      subtotal: Number(item.subtotal) || 0,
    });
  }

  writeJSON('orders.json', orders);
  writeJSON('order_items.json', orderItems);
  return { order_id: id, order_number: orderNumber };
}

function queryOrders() {
  const orders = readJSON('orders.json');
  const orderItems = readJSON('order_items.json');
  return orders.map(o => ({
    ...o,
    item_count: orderItems.filter(i => i.order_id === o.id).length,
  })).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function queryOrder(id) {
  const orders = readJSON('orders.json');
  const order = orders.find(o => o.id === Number(id));
  if (!order) return null;
  const items = readJSON('order_items.json').filter(i => i.order_id === order.id).map(row => ({
    ...row,
    custom_params: (() => { try { return JSON.parse(row.custom_params || '{}'); } catch { return {}; } })(),
  }));
  return { ...order, items };
}

module.exports = {
  queryProducts, queryProduct, insertProduct, updateProduct, deleteProduct,
  queryVariants, insertVariant, batchInsertVariants, updateVariant, deleteVariant,
  insertOrder, queryOrders, queryOrder,
};

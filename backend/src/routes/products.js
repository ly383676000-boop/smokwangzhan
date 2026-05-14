const express = require('express');
const router = express.Router();
const { runQuery, runInsert, getDB } = require('../db/init');
const { authMiddleware } = require('./auth');

// Helper: parse images field (JSON string → array)
function parseImages(imagesField) {
  if (!imagesField) return [];
  if (Array.isArray(imagesField)) return imagesField;
  try {
    const parsed = JSON.parse(imagesField);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper: parse variant_options (JSON string → array)
function parseVariantOptions(voField) {
  if (!voField) return [];
  if (Array.isArray(voField)) return voField;
  try {
    const parsed = JSON.parse(voField);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Get all products
router.get('/', (req, res) => {
  try {
    const products = runQuery(`
      SELECT * FROM products
      ORDER BY created_at DESC
    `);
    
    const result = (products || []).map(p => ({
      ...p,
      images: parseImages(p.images),
      image_url: parseImages(p.images)[0] || null,
      variant_options: parseVariantOptions(p.variant_options),
      box_qty: p.box_qty || 1,
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = runQuery(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    
    if (!product || product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const p = product[0];
    
    res.json({
      ...p,
      images: parseImages(p.images),
      image_url: parseImages(p.images)[0] || null,
      variant_options: parseVariantOptions(p.variant_options),
      box_qty: p.box_qty || 1,
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (需要认证)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { 
      name, name_en, brand, description, description_en, price, images, image_url, category,
      variant_options, box_qty, sku
    } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const boxQty = Math.max(1, parseInt(box_qty) || 1);

    // images: support both `images` (array/JSON) and `image_url` (single URL from admin)
    let imagesJSON = null;
    const imagesSource = images || (image_url ? [image_url] : null);
    if (imagesSource) {
      if (Array.isArray(imagesSource)) {
        imagesJSON = JSON.stringify(imagesSource);
      } else if (typeof imagesSource === 'string') {
        try {
          const parsed = JSON.parse(imagesSource);
          imagesJSON = Array.isArray(parsed) ? imagesSource : JSON.stringify([imagesSource]);
        } catch {
          imagesJSON = JSON.stringify([imagesSource]);
        }
      }
    }

    // variant_options: array of {name, nameEn, values: string[]}
    let voJSON = null;
    if (variant_options) {
      if (Array.isArray(variant_options)) {
        voJSON = JSON.stringify(variant_options);
      } else if (typeof variant_options === 'string') {
        voJSON = variant_options;
      }
    }
    
    const id = runInsert(
      `INSERT INTO products (name, name_en, brand, description, description_en, price, images, category, variant_options, box_qty, sku)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, name_en || null, brand || null, description || null, description_en || null, price, imagesJSON, category || null, voJSON, boxQty, sku || null]
    );
    
    res.json({ id, message: 'Product created successfully' });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (需要认证)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { 
      name, name_en, brand, description, description_en, price, images, image_url, category,
      variant_options, box_qty, sku
    } = req.body;
    const db = getDB();

    const boxQty = Math.max(1, parseInt(box_qty) || 1);

    // images: support both `images` (array/JSON) and `image_url` (single URL from admin)
    let imagesJSON = null;
    const imagesSource = images || (image_url ? [image_url] : null);
    if (imagesSource) {
      if (Array.isArray(imagesSource)) {
        imagesJSON = JSON.stringify(imagesSource);
      } else if (typeof imagesSource === 'string') {
        try {
          const parsed = JSON.parse(imagesSource);
          imagesJSON = Array.isArray(parsed) ? imagesSource : JSON.stringify([imagesSource]);
        } catch {
          imagesJSON = JSON.stringify([imagesSource]);
        }
      }
    } else {
      // If no images sent, keep existing images (don't overwrite with null)
      const existing = runQuery('SELECT images FROM products WHERE id = ?', [req.params.id]);
      if (existing && existing.length > 0) {
        imagesJSON = existing[0].images;
      }
    }
    
    // variant_options
    let voJSON = null;
    if (variant_options) {
      if (Array.isArray(variant_options)) {
        voJSON = JSON.stringify(variant_options);
      } else if (typeof variant_options === 'string') {
        voJSON = variant_options;
      }
    }
    
    db.run(
      `UPDATE products SET name=?, name_en=?, brand=?, description=?, description_en=?, price=?, images=?, category=?, variant_options=?, box_qty=?, sku=?
       WHERE id=?`,
      [name, name_en || null, brand || null, description || null, description_en || null, price, imagesJSON, category || null, voJSON, boxQty, sku || null, req.params.id]
    );
    
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (需要认证)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Batch delete products (需要认证)
router.post('/batch-delete', authMiddleware, (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    
    const db = getDB();
    const placeholders = ids.map(() => '?').join(',');
    
    db.run(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
    
    res.json({ message: `${ids.length} products deleted successfully` });
  } catch (err) {
    console.error('Error batch deleting products:', err);
    res.status(500).json({ error: 'Failed to batch delete products' });
  }
});

module.exports = router;

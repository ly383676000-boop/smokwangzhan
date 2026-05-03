const express = require('express');
const router = express.Router();
const { runQuery, runInsert, getDB } = require('../db/init');

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

// Create product
router.post('/', (req, res) => {
  try {
    const { 
      name, name_en, brand, description, description_en, price, images, category,
      variant_options, box_qty
    } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const boxQty = Math.max(1, parseInt(box_qty) || 1);

    // images can be: array of URLs, or JSON string, or null
    let imagesJSON = null;
    if (images) {
      if (Array.isArray(images)) {
        imagesJSON = JSON.stringify(images);
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          imagesJSON = Array.isArray(parsed) ? images : JSON.stringify([images]);
        } catch {
          imagesJSON = JSON.stringify([images]);
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
      `INSERT INTO products (name, name_en, brand, description, description_en, price, images, category, variant_options, box_qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, name_en || null, brand || null, description || null, description_en || null, price, imagesJSON, category || null, voJSON, boxQty]
    );
    
    res.json({ id, message: 'Product created successfully' });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', (req, res) => {
  try {
    const { 
      name, name_en, brand, description, description_en, price, images, category,
      variant_options, box_qty
    } = req.body;
    const db = getDB();

    const boxQty = Math.max(1, parseInt(box_qty) || 1);

    // images
    let imagesJSON = null;
    if (images) {
      if (Array.isArray(images)) {
        imagesJSON = JSON.stringify(images);
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          imagesJSON = Array.isArray(parsed) ? images : JSON.stringify([images]);
        } catch {
          imagesJSON = JSON.stringify([images]);
        }
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
      `UPDATE products SET name=?, name_en=?, brand=?, description=?, description_en=?, price=?, images=?, category=?, variant_options=?, box_qty=?
       WHERE id=?`,
      [name, name_en || null, brand || null, description || null, description_en || null, price, imagesJSON, category || null, voJSON, boxQty, req.params.id]
    );
    
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Batch delete products
router.post('/batch-delete', (req, res) => {
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

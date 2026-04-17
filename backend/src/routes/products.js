const express = require('express');
const router = express.Router();
const { runQuery, runInsert, getDB } = require('../db/init');

// Get all products
router.get('/', (req, res) => {
  try {
    const products = runQuery(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count,
        (SELECT GROUP_CONCAT(DISTINCT color) FROM product_variants WHERE product_id = p.id AND color IS NOT NULL AND color != '') as colors
      FROM products p
      ORDER BY p.created_at DESC
    `);
    
    res.json(products || []);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product with variants
router.get('/:id', (req, res) => {
  try {
    const product = runQuery(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    
    if (!product || product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const variants = runQuery(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [req.params.id]
    );
    
    res.json({
      ...product[0],
      variants: variants || []
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
      name, name_en, brand, description, description_en, price, image_url, category,
      colors, sizes, specifications, materials,
      custom1_name, custom1_values, custom2_name, custom2_values, custom3_name, custom3_values
    } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const id = runInsert(
      `INSERT INTO products (name, name_en, brand, description, description_en, price, image_url, category,
        colors, sizes, specifications, materials,
        custom1_name, custom1_values, custom2_name, custom2_values, custom3_name, custom3_values)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, name_en, brand, description, description_en, price, image_url, category,
       colors, sizes, specifications, materials,
       custom1_name, custom1_values, custom2_name, custom2_values, custom3_name, custom3_values]
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
      name, name_en, brand, description, description_en, price, image_url, category,
      colors, sizes, specifications, materials,
      custom1_name, custom1_values, custom2_name, custom2_values, custom3_name, custom3_values
    } = req.body;
    const db = getDB();
    
    db.run(
      `UPDATE products SET name=?, name_en=?, brand=?, description=?, description_en=?, price=?, image_url=?, category=?,
        colors=?, sizes=?, specifications=?, materials=?,
        custom1_name=?, custom1_values=?, custom2_name=?, custom2_values=?, custom3_name=?, custom3_values=?
       WHERE id=?`,
      [name, name_en, brand, description, description_en, price, image_url, category,
       colors, sizes, specifications, materials,
       custom1_name, custom1_values, custom2_name, custom2_values, custom3_name, custom3_values, req.params.id]
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
    
    // Delete variants first
    db.run('DELETE FROM product_variants WHERE product_id = ?', [req.params.id]);
    // Delete product
    db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;

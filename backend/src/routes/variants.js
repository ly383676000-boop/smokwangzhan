const express = require('express');
const router = express.Router();
const { runQuery, runInsert, getDB } = require('../db/init');

// Get variants for a product
router.get('/product/:productId', (req, res) => {
  try {
    const variants = runQuery(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [req.params.productId]
    );
    res.json(variants || []);
  } catch (err) {
    console.error('Error fetching variants:', err);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
});

// Create variant
router.post('/', (req, res) => {
  try {
    const {
      product_id, sku, color, size, specification, material,
      custom_param1_name, custom_param1_value,
      custom_param2_name, custom_param2_value,
      custom_param3_name, custom_param3_value,
      notes, price_modifier, stock, image_url
    } = req.body;
    
    if (!product_id || !sku) {
      return res.status(400).json({ error: 'Product ID and SKU are required' });
    }
    
    const id = runInsert(
      `INSERT INTO product_variants 
       (product_id, sku, color, size, specification, material,
        custom_param1_name, custom_param1_value,
        custom_param2_name, custom_param2_value,
        custom_param3_name, custom_param3_value,
        notes, price_modifier, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, sku, color, size, specification, material,
       custom_param1_name, custom_param1_value,
       custom_param2_name, custom_param2_value,
       custom_param3_name, custom_param3_value,
       notes, price_modifier || 0, stock || 100, image_url]
    );
    
    res.json({ id, message: 'Variant created successfully' });
  } catch (err) {
    console.error('Error creating variant:', err);
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

// Batch create variants
router.post('/batch', (req, res) => {
  try {
    const { product_id, variants } = req.body;
    
    if (!product_id || !variants || !Array.isArray(variants)) {
      return res.status(400).json({ error: 'Product ID and variants array are required' });
    }
    
    const db = getDB();
    const created = [];
    
    for (const v of variants) {
      const id = runInsert(
        `INSERT INTO product_variants 
         (product_id, sku, color, size, specification, material,
          custom_param1_name, custom_param1_value,
          custom_param2_name, custom_param2_value,
          custom_param3_name, custom_param3_value,
          notes, price_modifier, stock, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product_id, v.sku, v.color, v.size, v.specification, v.material,
         v.custom_param1_name, v.custom_param1_value,
         v.custom_param2_name, v.custom_param2_value,
         v.custom_param3_name, v.custom_param3_value,
         v.notes, v.price_modifier || 0, v.stock || 100, v.image_url]
      );
      created.push({ id, sku: v.sku });
    }
    
    res.json({ message: `${created.length} variants created`, variants: created });
  } catch (err) {
    console.error('Error batch creating variants:', err);
    res.status(500).json({ error: 'Failed to batch create variants' });
  }
});

// Update variant
router.put('/:id', (req, res) => {
  try {
    const {
      sku, color, size, specification, material,
      custom_param1_name, custom_param1_value,
      custom_param2_name, custom_param2_value,
      custom_param3_name, custom_param3_value,
      notes, price_modifier, stock, image_url
    } = req.body;
    
    const db = getDB();
    db.run(
      `UPDATE product_variants SET 
       sku=?, color=?, size=?, specification=?, material=?,
       custom_param1_name=?, custom_param1_value=?,
       custom_param2_name=?, custom_param2_value=?,
       custom_param3_name=?, custom_param3_value=?,
       notes=?, price_modifier=?, stock=?, image_url=?
       WHERE id=?`,
      [sku, color, size, specification, material,
       custom_param1_name, custom_param1_value,
       custom_param2_name, custom_param2_value,
       custom_param3_name, custom_param3_value,
       notes, price_modifier || 0, stock || 100, image_url, req.params.id]
    );
    
    res.json({ message: 'Variant updated successfully' });
  } catch (err) {
    console.error('Error updating variant:', err);
    res.status(500).json({ error: 'Failed to update variant' });
  }
});

// Delete variant
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    db.run('DELETE FROM product_variants WHERE id = ?', [req.params.id]);
    res.json({ message: 'Variant deleted successfully' });
  } catch (err) {
    console.error('Error deleting variant:', err);
    res.status(500).json({ error: 'Failed to delete variant' });
  }
});

// Generate SKU combinations
router.post('/generate-combinations', (req, res) => {
  try {
    const { prefix, colors = [], sizes = [], specifications = [], materials = [], custom1 = {}, custom2 = {}, custom3 = {} } = req.body;
    
    const combinations = [];
    
    for (const color of colors) {
      for (const size of sizes) {
        for (const spec of specifications) {
          for (const material of materials) {
            const skuParts = [prefix, color, size, spec, material];
            
            if (custom1.value) skuParts.push(custom1.value);
            if (custom2.value) skuParts.push(custom2.value);
            if (custom3.value) skuParts.push(custom3.value);
            
            combinations.push({
              sku: skuParts.join('-').toUpperCase(),
              color,
              size,
              specification: spec,
              material,
              custom_param1_name: custom1.name || null,
              custom_param1_value: custom1.value || null,
              custom_param2_name: custom2.name || null,
              custom_param2_value: custom2.value || null,
              custom_param3_name: custom3.name || null,
              custom_param3_value: custom3.value || null,
            });
          }
        }
      }
    }
    
    res.json({ 
      count: combinations.length,
      combinations 
    });
  } catch (err) {
    console.error('Error generating combinations:', err);
    res.status(500).json({ error: 'Failed to generate combinations' });
  }
});

module.exports = router;

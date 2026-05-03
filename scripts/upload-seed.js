/**
 * Upload seed data to Vercel API.
 * Usage: node scripts/upload-seed.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://20260411235243.vercel.app';

async function main() {
  // Step 1: Login
  console.log('Logging in...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'smok2024' }),
  });
  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    console.error('Login failed:', loginData.error);
    process.exit(1);
  }

  const token = loginData.token;
  console.log('Login successful! Token acquired.');

  // Step 2: Read seed data
  const productsFile = path.join(__dirname, '..', 'data', 'products.json');
  const variantsFile = path.join(__dirname, '..', 'data', 'variants.json');

  if (!fs.existsSync(productsFile)) {
    console.error('No products.json found. Run seed.js first.');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  const variants = fs.existsSync(variantsFile)
    ? JSON.parse(fs.readFileSync(variantsFile, 'utf8'))
    : [];

  console.log(`Read ${products.length} products and ${variants.length} variants from local data.`);

  // Step 3: Upload in batches (Vercel has body size limits)
  const BATCH_SIZE = 50;
  let totalUploaded = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batchProducts = products.slice(i, i + BATCH_SIZE);
    const batchVariants = variants.filter(v =>
      v.product_id >= products[i].id && v.product_id <= products[Math.min(i + BATCH_SIZE - 1, products.length - 1)].id
    );

    // For first batch, append=false (replace). For rest, append=true
    const isAppend = i > 0;

    console.log(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)} (${batchProducts.length} products)...`);

    const seedRes = await fetch(`${BASE_URL}/api/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        products: batchProducts.map((p, idx) => ({
          ...p,
          id: i + idx + 1, // Remap IDs for each batch
        })),
        variants: batchVariants.map((v, idx) => ({
          ...v,
          id: i + idx + 1,
          product_id: v.product_id, // Keep original product_id reference
        })),
        append: isAppend,
      }),
    });

    const seedData = await seedRes.json();

    if (!seedRes.ok) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, seedData.error);
      // Retry once
      console.log('Retrying...');
      await new Promise(r => setTimeout(r, 2000));

      const retryRes = await fetch(`${BASE_URL}/api/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: batchProducts,
          variants: batchVariants,
          append: isAppend,
        }),
      });
      const retryData = await retryRes.json();
      if (!retryRes.ok) {
        console.error(`Retry also failed:`, retryData.error);
        process.exit(1);
      }
      totalUploaded += batchProducts.length;
      console.log(`  Retry succeeded. Total: ${totalUploaded}`);
    } else {
      totalUploaded += batchProducts.length;
      console.log(`  Success. Total: ${totalUploaded}/${products.length}`);
    }

    // Small delay between batches
    if (i + BATCH_SIZE < products.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\nDone! Uploaded ${totalUploaded} products total.`);
  console.log(`View your site: ${BASE_URL}`);
  console.log(`Admin panel: ${BASE_URL}/admin`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

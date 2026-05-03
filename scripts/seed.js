/**
 * Smoke Shop Product Data Seeder
 * Generates 20 categories with ~500 SKUs total
 * Output: data/products.json and data/variants.json
 */

const fs = require('fs');
const path = require('path');

// ============ Category Definitions ============
const categories = [
  { name: 'Pipes', name_zh: '烟斗', count: 30 },
  { name: 'Bongs', name_zh: '水烟壶', count: 30 },
  { name: 'Rolling Papers', name_zh: '卷烟纸', count: 25 },
  { name: 'Grinders', name_zh: '研磨器', count: 25 },
  { name: 'Lighters', name_zh: '打火机', count: 25 },
  { name: 'Vaporizers', name_zh: '电子烟', count: 30 },
  { name: 'Hookahs', name_zh: '阿拉伯水烟', count: 25 },
  { name: 'Ashtrays', name_zh: '烟灰缸', count: 25 },
  { name: 'Storage', name_zh: '储存盒', count: 25 },
  { name: 'Dab Rigs', name_zh: '烟油壶', count: 25 },
  { name: 'Rolling Trays', name_zh: '卷烟托盘', count: 25 },
  { name: 'Filter Tips', name_zh: '过滤嘴', count: 25 },
  { name: 'Pipes - Glass', name_zh: '玻璃烟斗', count: 25 },
  { name: 'Cleaning Supplies', name_zh: '清洁用品', count: 25 },
  { name: 'Smell Proof Bags', name_zh: '防味袋', count: 20 },
  { name: 'Torch Lighters', name_zh: '喷枪打火机', count: 25 },
  { name: 'One Hitters', name_zh: '小烟管', count: 25 },
  { name: 'Pre-Roll Cones', name_zh: '预制锥形纸', count: 25 },
  { name: 'Dab Tools', name_zh: '取油工具', count: 25 },
  { name: 'Accessories', name_zh: '配件', count: 30 },
];

// ============ Product Templates ============
const templates = {
  'Pipes': [
    { prefix: 'Classic Wooden Pipe', variants: ['Briar Wood', 'Rosewood', 'Cherry Wood', 'Ebony', 'Maple'], specs: ['Small', 'Medium', 'Large'] },
    { prefix: 'Metal Smoking Pipe', variants: ['Stainless Steel', 'Brass', 'Copper', 'Titanium'], specs: ['3 inch', '4 inch', '5 inch'] },
    { prefix: 'Meerschaum Pipe', variants: ['Plain', 'Carved Skull', 'Carved Eagle', 'Carved Lion'], specs: ['Standard', 'Premium'] },
    { prefix: 'Corn Cob Pipe', variants: ['Natural', 'Coated', 'Mini', 'Grand'], specs: ['Standard'] },
    { prefix: 'Spoon Pipe', variants: ['Fumed Glass', 'Color Changing', 'Clear Glass', 'Swirl Design'], specs: ['3"', '4"', '5"'] },
  ],
  'Bongs': [
    { prefix: 'Beaker Base Bong', variants: ['Clear', 'Blue', 'Green', 'Amber', 'Black'], specs: ['12 inch', '14 inch', '18 inch', '24 inch'] },
    { prefix: 'Straight Tube Bong', variants: ['Clear', 'Smoke Tint', 'Blue Rim', 'Green Stripe'], specs: ['14 inch', '18 inch', '22 inch'] },
    { prefix: 'Recycler Bong', variants: ['Clear Glass', 'Fumed', 'Color Accented'], specs: ['10 inch', '12 inch', '14 inch'] },
    { prefix: 'Mini Bong', variants: ['6 inch Clear', '8 inch Blue', '7 inch Green', '9 inch Pink'], specs: ['Standard'] },
    { prefix: 'Dab Rig / Bong Hybrid', variants: ['Clear', 'Black', 'Teal'], specs: ['10 inch', '12 inch'] },
  ],
  'Rolling Papers': [
    { prefix: 'Ultra Thin Papers', variants: ['Unbleached', 'Bleached White', 'Natural Brown', 'Hemp'], specs: ['King Size Slim', 'Regular', '1 1/4"', 'Wide'] },
    { prefix: 'Flavored Papers', variants: ['Strawberry', 'Grape', 'Blueberry', 'Vanilla', 'Chocolate', 'Mango'], specs: ['King Size', '1 1/4"'] },
    { prefix: 'Premium Rice Papers', variants: ['Gold', 'Silver', 'Classic'], specs: ['King Size Slim', 'Regular'] },
    { prefix: 'Hemp Wraps', variants: ['Natural', 'Blunt Size', 'Cigar Size'], specs: ['Original', 'Honey', 'Sweet'] },
  ],
  'Grinders': [
    { prefix: '4-Piece Herb Grinder', variants: ['Aluminum Black', 'Aluminum Silver', 'Aluminum Blue', 'Aluminum Gold', 'Aluminum Red'], specs: ['50mm', '62mm', '75mm'] },
    { prefix: '2-Piece Grinder', variants: ['Zinc Alloy', 'Acrylic Clear', 'Wooden'], specs: ['40mm', '50mm', '63mm'] },
    { prefix: 'Electric Grinder', variants: ['USB Rechargeable', 'Battery Powered', 'Electric Automatic'], specs: ['Standard'] },
    { prefix: 'Card Grinder', variants: ['Metal Credit Card', 'Plastic Pocket', 'Stainless Steel'], specs: ['Standard'] },
  ],
  'Lighters': [
    { prefix: 'BIC Lighter', variants: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'Purple', 'Orange', 'Pink'], specs: ['Standard'] },
    { prefix: 'Zippo Lighter', variants: ['Classic Chrome', 'Matte Black', 'Brushed Brass', 'High Polish', 'Armor'], specs: ['Standard'] },
    { prefix: 'Clipper Lighter', variants: ['Solid Colors', 'Floral Print', 'Skull Print', 'Tie Dye'], specs: ['Standard', 'Mini'] },
    { prefix: 'Refillable Jet Lighter', variants: ['Single Flame', 'Double Flame', 'Triple Flame', 'Quad Flame'], specs: ['Standard', 'Large Tank'] },
  ],
  'Vaporizers': [
    { prefix: 'Dry Herb Vaporizer', variants: ['Convection', 'Conduction', 'Hybrid', 'Portable', 'Desktop'], specs: ['Basic', 'Pro', 'Elite'] },
    { prefix: 'Box Mod Vape', variants: ['100W', '150W', '200W', '250W'], specs: ['Starter Kit', 'Advanced Kit'] },
    { prefix: 'Pod System', variants: ['Closed Pod', 'Open Pod', 'Disposable', 'Refillable'], specs: ['Standard', 'Pro'] },
    { prefix: 'Pen Style Vape', variants: ['Slim', 'Fat Boy', 'Variable Voltage', '510 Thread'], specs: ['350mAh', '650mAh', '900mAh'] },
  ],
  'Hookahs': [
    { prefix: 'Traditional Hookah', variants: ['Egyptian Style', 'Syrian Style', 'Turkish Style'], specs: ['Small (22")', 'Medium (28")', 'Large (34")'] },
    { prefix: 'Modern Hookah', variants: ['Stainless Steel', 'Aluminum', 'Glass Base', 'LED Base'], specs: ['Single Hose', 'Double Hose', 'Triple Hose'] },
    { prefix: 'Mini Hookah', variants: ['Tabletop', 'Portable', 'Travel'], specs: ['Standard'] },
  ],
  'Ashtrays': [
    { prefix: 'Glass Ashtray', variants: ['Round Clear', 'Square Black', 'Round Blue', 'Diamond Shape', ' Skull Design'], specs: ['4 inch', '5 inch', '6 inch', '8 inch'] },
    { prefix: 'Metal Ashtray', variants: ['Stainless Steel', 'Brushed Nickel', 'Matte Black', 'Vintage Bronze'], specs: ['4 inch', '5 inch', '6 inch'] },
    { prefix: 'Silicone Ashtray', variants: ['Black', 'Red', 'Blue', 'Green', 'Purple'], specs: ['Standard', 'Large', 'Pocket Size'] },
  ],
  'Storage': [
    { prefix: 'Smell Proof Jar', variants: ['Glass 1oz', 'Glass 2oz', 'Glass 4oz', 'Glass 8oz', 'Glass 16oz'], specs: ['Standard', 'UV Protected'] },
    { prefix: 'Stash Box', variants: ['Wooden', 'Metal', 'Leather', 'Carbon Fiber'], specs: ['Small', 'Medium', 'Large'] },
    { prefix: 'Humidor Box', variants: ['Mahogany', 'Walnut', 'Acrylic'], specs: ['25 Cigar', '50 Cigar', '100 Cigar'] },
    { prefix: 'Smell Proof Container', variants: ['Black', 'Green', 'Tan'], specs: ['Small', 'Medium', 'Large', 'X-Large'] },
  ],
  'Dab Rigs': [
    { prefix: 'Recycler Dab Rig', variants: ['Clear', 'Color Changing', 'Fumed Glass'], specs: ['6 inch', '8 inch', '10 inch'] },
    { prefix: 'Mini Dab Rig', variants: ['Silicone', 'Glass', 'Hybrid'], specs: ['4 inch', '5 inch', '6 inch'] },
    { prefix: 'Electric Dab Rig', variants: ['Portable', 'Desktop', 'Smart Temp'], specs: ['Standard', 'Pro'] },
    { prefix: 'Thermal Banger Rig', variants: ['Clear', 'Colored Joint', 'Full Color'], specs: ['10mm', '14mm'] },
  ],
  'Rolling Trays': [
    { prefix: 'Metal Rolling Tray', variants: ['Large - Plain', 'Medium - Skull', 'Small - Mushroom', 'Large - Strain Leaf', 'Medium - Retro'], specs: ['Small (7x5)', 'Medium (11x7)', 'Large (14x11)'] },
    { prefix: 'Glass Rolling Tray', variants: ['Clear', 'Frosted', 'Tinted Black'], specs: ['Medium', 'Large'] },
    { prefix: 'Wood Rolling Tray', variants: ['Bamboo', 'Walnut', 'Engraved'], specs: ['Medium', 'Large'] },
  ],
  'Filter Tips': [
    { prefix: 'Glass Filter Tips', variants: ['Clear Plain', 'Colored Tips', 'Rainbow Tips', 'Fumed'], specs: ['6mm', '8mm', '10mm'] },
    { prefix: 'Pre-Rolled Tips', variants: ['Unbleached', 'Organic Hemp', 'Brown Regular', 'Brown Slim'], specs: ['Regular', 'Slim', 'King Size'] },
    { prefix: 'Activated Carbon Filter', variants: ['Regular', 'Slim', 'Mini'], specs: ['6mm', '7mm', '8mm'] },
  ],
  'Pipes - Glass': [
    { prefix: 'Hand Pipe Glass', variants: ['Fumed', 'Inside-Out', 'Swirl', 'Chillum', 'Sherlock'], specs: ['3 inch', '4 inch', '5 inch', '6 inch'] },
    { prefix: 'Steamroller Pipe', variants: ['Clear', 'Fumed', 'Color Changing', 'Rasta'], specs: ['6 inch', '8 inch', '10 inch'] },
    { prefix: 'Artisan Glass Pipe', variants: ['UV Reactive', 'Gold Fumed', 'Silver Fumed', 'Chameleon'], specs: ['4 inch', '5 inch'] },
  ],
  'Cleaning Supplies': [
    { prefix: 'Pipe Cleaners', variants: ['Standard', 'Extra Thick', 'Fluffy', 'Super Soft'], specs: ['100 Pack', '300 Pack', '500 Pack'] },
    { prefix: 'Cleaning Solution', variants: ['4oz Formula 420', '8oz Formula 420', '16oz Orange Chronic', '32oz Simple Green'], specs: ['Standard'] },
    { prefix: 'Cleaning Kit', variants: ['Basic Kit', 'Deluxe Kit', 'Premium Kit'], specs: ['Standard'] },
    { prefix: 'Q-Tips Cotton Swabs', variants: ['Standard', 'Extra Long', 'Bamboo Stick'], specs: ['100 Pack', '500 Pack', '1000 Pack'] },
  ],
  'Smell Proof Bags': [
    { prefix: 'Smell Proof Pouch', variants: ['Black Small', 'Black Medium', 'Black Large', 'Camouflage', 'Green', 'Tan'], specs: ['Small', 'Medium', 'Large'] },
    { prefix: 'Smell Proof Backpack', variants: ['Black', 'Gray', 'Military Green'], specs: ['Standard', 'Deluxe'] },
    { prefix: 'Vacuum Seal Bag', variants: ['Small', 'Medium', 'Large'], specs: ['10 Pack', '50 Pack'] },
  ],
  'Torch Lighters': [
    { prefix: 'Single Flame Torch', variants: ['Silver', 'Black', 'Blue', 'Red', 'Gunmetal'], specs: ['Standard', 'Large'] },
    { prefix: 'Double Flame Torch', variants: ['Silver', 'Black', 'Blue', 'Rose Gold'], specs: ['Standard', 'Large Tank'] },
    { prefix: 'Quad Flame Torch', variants: ['Silver', 'Black', 'Rainbow'], specs: ['Standard', 'Large Tank'] },
    { prefix: 'Table Top Torch', variants: ['Single Jet', 'Dual Jet', 'Triple Jet'], specs: ['Standard'] },
  ],
  'One Hitters': [
    { prefix: 'Metal One Hitter', variants: ['Silver', 'Black', 'Gold', 'Rainbow', 'Brass'], specs: ['Standard 3"', 'Short 2"', 'Long 4"'] },
    { prefix: 'Glass One Hitter', variants: ['Clear', 'Fumed', 'Color Changing', 'Chameleon'], specs: ['Standard'] },
    { prefix: 'Dugout Set', variants: ['Wooden', 'Aluminum', 'Acrylic'], specs: ['Standard', 'Large'] },
  ],
  'Pre-Roll Cones': [
    { prefix: 'Raw Pre-Roll Cone', variants: ['Classic 1 1/4"', 'King Size', 'Special', 'Lean', 'Organic Hemp'], specs: ['1 Pack (3)', '6 Pack', '32 Pack', '50 Pack'] },
    { prefix: 'Joint Cones', variants: ['Unbleached', 'Natural', 'Ultra Thin'], specs: ['1 1/4"', 'King Size', '98 Special'] },
    { prefix: 'Cone Filler', variants: ['Manual', 'Electric', 'Rocket', 'King Roller'], specs: ['Standard'] },
  ],
  'Dab Tools': [
    { prefix: 'Dabber Tool', variants: ['Titanium', 'Quartz', 'Ceramic', 'Stainless Steel', 'Glass'], specs: ['Standard', 'Flat Tip', 'Ball Tip', 'Scoop'] },
    { prefix: 'Carb Cap', variants: ['Bubble Cap', 'Directional', 'Pearl Set', 'Thermal'], specs: ['Standard', 'XL'] },
    { prefix: 'Dab Mat', variants: ['Silicone Black', 'Silicone Green', 'Silicone Blue', 'Custom Print'], specs: ['8 inch', '12 inch', '16 inch'] },
    { prefix: 'Silicone Container', variants: ['Black', 'Red', 'Blue', 'Green', 'Purple', 'White'], specs: ['5ml', '10ml', '25ml'] },
  ],
  'Accessories': [
    { prefix: 'Hemp Wick', variants: ['Natural 50ft', 'Natural 200ft', 'Organic 50ft', 'Organic 200ft'], specs: ['Standard'] },
    { prefix: 'Rolling Machine', variants: ['78mm', '110mm', 'Standard', 'Electric'], specs: ['Standard'] },
    { prefix: 'Pipe Holder/Stand', variants: ['Wooden', 'Metal', 'Acrylic', 'Leather'], specs: ['Single', '3-Pack', '6-Pack'] },
    { prefix: 'Smoking Accessories Set', variants: ['Starter Kit', 'Travel Kit', 'Complete Kit', 'Gift Set'], specs: ['Standard'] },
  ],
};

// ============ Price Ranges by Category ============
const priceRanges = {
  'Pipes': { min: 8, max: 120 },
  'Bongs': { min: 25, max: 350 },
  'Rolling Papers': { min: 1, max: 8 },
  'Grinders': { min: 8, max: 80 },
  'Lighters': { min: 1, max: 65 },
  'Vaporizers': { min: 15, max: 300 },
  'Hookahs': { min: 40, max: 400 },
  'Ashtrays': { min: 5, max: 45 },
  'Storage': { min: 5, max: 60 },
  'Dab Rigs': { min: 30, max: 250 },
  'Rolling Trays': { min: 8, max: 30 },
  'Filter Tips': { min: 2, max: 15 },
  'Pipes - Glass': { min: 15, max: 150 },
  'Cleaning Supplies': { min: 3, max: 25 },
  'Smell Proof Bags': { min: 8, max: 50 },
  'Torch Lighters': { min: 10, max: 60 },
  'One Hitters': { min: 5, max: 30 },
  'Pre-Roll Cones': { min: 3, max: 45 },
  'Dab Tools': { min: 5, max: 50 },
  'Accessories': { min: 3, max: 40 },
};

// ============ Description Templates ============
const descriptions = {
  'Pipes': 'High-quality {material} pipe, perfect for a smooth smoking experience. Durable construction with a classic design.',
  'Bongs': 'Premium glass water pipe with {feature}. Thick borosilicate glass for durability. Includes downstem and bowl.',
  'Rolling Papers': 'Ultra-fine rolling papers made from {material}. Slow burning, even burn, minimal ash. Easy to roll.',
  'Grinders': 'Sharp diamond-shaped teeth for perfect grinding every time. {material} body, magnetic lid, pollen catcher.',
  'Lighters': 'Reliable {type} lighter with adjustable flame. Refillable and built to last.',
  'Vaporizers': 'Advanced {type} vaporizer with temperature control. Sleek design, long battery life, pure flavor.',
  'Hookahs': 'Traditional {style} hookah with premium quality hose and bowl. Easy to assemble and clean.',
  'Ashtrays': 'Durable {material} ashtray with deep bowl design. Easy to clean, wind-resistant.',
  'Storage': 'Airtight {material} container for freshness. Smell-proof and discreet.',
  'Dab Rigs': 'Premium borosilicate glass dab rig with {feature}. Smooth hits, great flavor.',
  'Rolling Trays': 'Curved edges keep everything in place. {material} construction, easy to clean.',
  'Filter Tips': 'Premium quality tips for a smoother smoking experience. {material}, easy to use.',
  'Pipes - Glass': 'Hand-blown borosilicate glass pipe with {feature}. Color changing properties with use.',
  'Cleaning Supplies': 'Professional grade cleaning solution. Safe for glass, metal, and ceramic. Fast acting.',
  'Smell Proof Bags': 'Activated carbon lining for maximum odor control. Water-resistant exterior.',
  'Torch Lighters': 'Powerful {type} torch flame, windproof design. Refillable butane tank.',
  'One Hitters': 'Discrete and portable {material} one hitter. Perfect for on-the-go use.',
  'Pre-Roll Cones': 'Pre-rolled {material} cones, ready to fill. Even burn, smooth draw.',
  'Dab Tools': 'Heat-resistant {material} dab tool with comfortable grip. Perfect for concentrates.',
  'Accessories': 'Essential smoking accessory for the perfect session. High quality, durable design.',
};

// ============ Image URL Placeholder ============
function getImageUrl(category, productIndex) {
  // Using placeholder images with category-based colors
  const colors = {
    'Pipes': '8B4513',
    'Bongs': '4169E1',
    'Rolling Papers': 'F5F5DC',
    'Grinders': 'C0C0C0',
    'Lighters': 'FF4500',
    'Vaporizers': '2E8B57',
    'Hookahs': '9370DB',
    'Ashtrays': '696969',
    'Storage': '8FBC8F',
    'Dab Rigs': 'FF6347',
    'Rolling Trays': '4682B4',
    'Filter Tips': 'DAA520',
    'Pipes - Glass': '00CED1',
    'Cleaning Supplies': '20B2AA',
    'Smell Proof Bags': '556B2F',
    'Torch Lighters': 'B22222',
    'One Hitters': 'D2691E',
    'Pre-Roll Cones': 'DEB887',
    'Dab Tools': '708090',
    'Accessories': 'CD853F',
  };
  const color = colors[category] || '808080';
  return `https://placehold.co/400x400/${color}/ffffff?text=${encodeURIComponent(category.split(' ')[0])}-${productIndex}`;
}

// ============ Generate Products ============
function generateProducts() {
  const products = [];
  const variants = [];
  let productId = 1;
  let variantId = 1;

  for (const cat of categories) {
    const catTemplates = templates[cat.name] || [];
    const priceRange = priceRanges[cat.name] || { min: 5, max: 50 };
    let productsInCategory = 0;
    const targetCount = cat.count;

    for (const tmpl of catTemplates) {
      if (productsInCategory >= targetCount) break;

      for (const variant of tmpl.variants) {
        if (productsInCategory >= targetCount) break;

        for (const spec of tmpl.specs) {
          if (productsInCategory >= targetCount) break;

          const price = Math.round((priceRange.min + Math.random() * (priceRange.max - priceRange.min)) * 100) / 100;
          const name = `${tmpl.prefix} - ${variant}`;

          products.push({
            id: productId,
            name: name,
            name_zh: `${tmpl.prefix} - ${variant}`,
            category: cat.name,
            price: price,
            description: (descriptions[cat.name] || '')
              .replace('{material}', variant)
              .replace('{feature}', spec)
              .replace('{type}', variant)
              .replace('{style}', variant),
            image: getImageUrl(cat.name, productId),
            created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
          });

          // Create variant entries for color/size options
          variants.push({
            id: variantId++,
            product_id: productId,
            sku: `SKU-${String(productId).padStart(4, '0')}-${spec.replace(/[^a-zA-Z0-9]/g, '')}`,
            color: variant.split(' ')[0],
            size: spec,
            price_modifier: 0,
            stock: Math.floor(Math.random() * 200) + 10,
          });

          productsInCategory++;
          productId++;
        }
      }
    }
  }

  return { products, variants };
}

// ============ Write Data ============
const data = generateProducts();
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(data.products, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'variants.json'), JSON.stringify(data.variants, null, 2));

console.log(`Generated ${data.products.length} products across ${categories.length} categories`);
console.log(`Generated ${data.variants.length} variants`);
console.log(`Data written to ${DATA_DIR}/`);
console.log('\nCategory breakdown:');
const breakdown = {};
for (const p of data.products) {
  breakdown[p.category] = (breakdown[p.category] || 0) + 1;
}
for (const [cat, count] of Object.entries(breakdown)) {
  console.log(`  ${cat}: ${count} products`);
}

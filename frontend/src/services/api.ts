const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiProduct {
  id: number;
  name: string;
  name_en: string;
  brand: string;
  description: string;
  description_en: string;
  price: number;
  image_url: string;
  category: string;
  colors: string;
  sizes: string;
  specifications: string;
  materials: string;
  custom1_name: string;
  custom1_values: string;
  custom2_name: string;
  custom2_values: string;
  custom3_name: string;
  custom3_values: string;
  variant_count: number;
  created_at: string;
}

export interface ApiVariant {
  id: number;
  product_id: number;
  sku: string;
  color: string;
  size: string;
  specification: string;
  material: string;
  custom_param1_name: string;
  custom_param1_value: string;
  custom_param2_name: string;
  custom_param2_value: string;
  custom_param3_name: string;
  custom_param3_value: string;
  notes: string;
  price_modifier: number;
  stock: number;
  image_url: string;
}

// Convert API product to frontend product
export function mapApiProduct(api: ApiProduct) {
  return {
    id: String(api.id),
    name: api.name || '',
    nameEn: api.name_en || '',
    description: api.description || '',
    descriptionEn: api.description_en || '',
    price: api.price || 0,
    brand: api.brand || '',
    image: api.image_url || '',
    images: api.image_url ? [api.image_url] : [],
    colors: api.colors ? api.colors.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    sizes: api.sizes ? api.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    specifications: api.specifications ? api.specifications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    materials: api.materials ? api.materials.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    sku: api.brand ? api.brand.substring(0, 3).toUpperCase() + '-' + String(api.id).padStart(3, '0') : 'SKU-' + String(api.id).padStart(3, '0'),
    category: api.category || '',
    custom1_name: api.custom1_name || '',
    custom1_values: api.custom1_values || '',
    custom2_name: api.custom2_name || '',
    custom2_values: api.custom2_values || '',
    custom3_name: api.custom3_name || '',
    custom3_values: api.custom3_values || '',
  };
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id: number): Promise<ApiProduct & { variants: ApiVariant[] }> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const products = await fetchProducts();
  const cats = new Set<string>();
  products.forEach((p) => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats);
}

export async function createOrder(orderData: {
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_postal_code: string;
  total_amount: number;
  items: Array<{
    product_name: string;
    variant_sku: string;
    color: string;
    size: string;
    specification: string;
    material: string;
    custom_param1: string;
    custom_param2: string;
    custom_param3: string;
    notes: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

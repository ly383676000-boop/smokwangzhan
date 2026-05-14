// Vercel 全栈部署：API 和前端同域，直接用相对路径
// 本地开发时后端跑在 localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ApiVariantOption {
  name: string;
  nameEn: string;
  values: string[];
}

export interface ApiProduct {
  id: number;
  name: string;
  name_en: string;
  brand: string;
  description: string;
  description_en: string;
  price: number;
  images: string[];
  image_url: string;
  category: string;
  variant_options: ApiVariantOption[];
  box_qty: number;
  created_at: string;
}

// Convert API product to frontend product
export function mapApiProduct(api: ApiProduct) {
  const images = api.images && Array.isArray(api.images) ? api.images : [];
  const image = images[0] || api.image_url || '';
  // Safety: ensure variant_options is always a proper array
  let variantOptions: ApiVariantOption[] = [];
  if (api.variant_options) {
    if (Array.isArray(api.variant_options)) {
      variantOptions = api.variant_options;
    } else if (typeof api.variant_options === 'string') {
      try {
        const parsed = JSON.parse(api.variant_options);
        variantOptions = Array.isArray(parsed) ? parsed : [];
      } catch { /* ignore */ }
    }
  }
  // Filter out entries with empty name (invalid options)
  variantOptions = variantOptions.filter(opt => opt && opt.name && opt.name.trim() !== '');
  return {
    id: String(api.id),
    name: api.name || '',
    nameEn: api.name_en || '',
    description: api.description || '',
    descriptionEn: api.description_en || '',
    price: api.price || 0,
    brand: api.brand || '',
    image: image,
    images: images.length > 0 ? images : (image ? [image] : []),
    variantOptions: variantOptions,
    sku: api.sku || (api.brand ? api.brand.substring(0, 3).toUpperCase() + '-' + String(api.id).padStart(3, '0') : 'SKU-' + String(api.id).padStart(3, '0')),
    category: api.category || '',
    boxQty: api.box_qty || 1,
  };
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id: number): Promise<ApiProduct> {
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

export async function batchDeleteProducts(ids: number[]): Promise<void> {
  const res = await fetch(`${API_BASE}/products/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to batch delete products');
  return res.json();
}

export async function createOrder(orderData: {
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  total_amount: number;
  items: Array<{
    product_name: string;
    variant_info: string;
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

// Company Settings API
export interface CompanySettings {
  company_name: string;
  company_name_zh: string;
  whatsapp: string;
  email: string;
  address: string;
  phone: string;
}

export async function fetchSettings(): Promise<CompanySettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: Partial<CompanySettings>): Promise<{ success: boolean; settings: CompanySettings }> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

// Variant option definition (from backend)
export interface VariantOption {
  name: string;       // 属性名（中文），如"颜色"
  nameEn: string;     // 属性名（英文），如"Color"
  values: string[];   // 可选值列表，如 ["Red", "Blue", "Black"]
}

// Product types
export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  brand: string;
  image: string;
  images?: string[];
  variantOptions: VariantOption[];
  sku: string;
  category?: string;
  boxQty: number; // 每箱数量（必填，最小1）
}

// Cart item variant - selected values for each option
export interface ProductVariant {
  [optionName: string]: string;  // e.g. { "颜色": "Red", "规格": "8mm" }
  notes?: string;
}

// Cart item
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;    // 总件数 = boxes × boxQty
  boxes: number;       // 箱数（客户输入）
  boxQty: number;      // 每箱数量（来自产品）
  variants: ProductVariant;
  price: number;
}

// Customer info - matches the form fields
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  notes: string;
}

// Language type
export type Language = 'en' | 'zh';

// Order data for PDF
export interface OrderData {
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
}

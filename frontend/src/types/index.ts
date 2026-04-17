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
  colors: string[];
  sizes: string[];
  specifications: string[];
  materials: string[];
  sku: string;
  category?: string;
  custom1_name?: string;
  custom1_values?: string;
  custom2_name?: string;
  custom2_values?: string;
  custom3_name?: string;
  custom3_values?: string;
}

// Cart item variant
export interface ProductVariant {
  color: string;
  size: string;
  specification: string;
  material: string;
  custom1?: { name: string; value: string };
  custom2?: { name: string; value: string };
  custom3?: { name: string; value: string };
  notes?: string;
}

// Cart item
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variants: ProductVariant;
  price: number;
}

// Customer info - matches the form fields
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
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

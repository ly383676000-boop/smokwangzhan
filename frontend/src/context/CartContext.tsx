import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, CustomerInfo, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variants: ProductVariant, boxes: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateBoxes: (itemId: string, boxes: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfoState] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    notes: '',
  });

  const addItem = useCallback((product: Product, variants: ProductVariant, boxes: number) => {
    const boxQty = product.boxQty || 1;
    const quantity = boxes * boxQty;

    setItems(prev => {
      // Check if same product with same variants already exists
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id &&
        JSON.stringify(item.variants) === JSON.stringify(variants)
      );

      if (existingIndex >= 0) {
        // Merge: increase boxes and recalculate
        const updated = [...prev];
        const existItem = updated[existingIndex];
        const newBoxes = existItem.boxes + boxes;
        updated[existingIndex] = {
          ...existItem,
          boxes: newBoxes,
          quantity: newBoxes * existItem.boxQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: generateId(),
        product,
        quantity,
        boxes,
        boxQty,
        variants,
        price: product.price,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, boxes: number) => {
    if (boxes < 1) return;
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, boxes, quantity: boxes * item.boxQty } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerInfoState({
      name: '', email: '', phone: '', address: '',
      country: '', notes: '',
    });
  }, []);

  const updateBoxes = useCallback((itemId: string, boxes: number) => {
    if (boxes < 1) return;
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, boxes, quantity: boxes * item.boxQty } : item
      )
    );
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    setCustomerInfoState(info);
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      updateBoxes,
      clearCart,
      getTotal,
      getItemCount,
      customerInfo,
      setCustomerInfo,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

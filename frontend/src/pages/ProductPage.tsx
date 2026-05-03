import React, { useState } from 'react';
import Header from '../components/Header';
import Cart from '../components/Cart';
import ProductDetail from '../components/ProductDetail';
import { useTheme } from '../context/ThemeContext';

const ProductPage: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.name === 'graffiti' ? '#0D0D0D' : '#F8F9FA' }}>
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        <ProductDetail />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: theme.footerBg }} className="mt-12">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <div className="pt-6 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
            © 2026 HONG KONG COOKIES TRADING LIMITED. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default ProductPage;

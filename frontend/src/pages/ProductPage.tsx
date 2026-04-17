import React, { useState } from 'react';
import Header from '../components/Header';
import Cart from '../components/Cart';
import ProductDetail from '../components/ProductDetail';

const ProductPage: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header onCartClick={() => setCartOpen(true)} />

      <main>
        <ProductDetail />
      </main>

      {/* Footer */}
      <footer className="bg-[#0D3B3B] text-white mt-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="border-t border-[#2D4A4A] pt-6 text-center text-sm text-[#CCCCCC]/60">
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

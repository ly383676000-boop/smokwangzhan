import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const colorMap: Record<string, string> = {
  'Black': '#1A1A1A', 'White': '#FFFFFF', 'Red': '#E03131',
  'Blue': '#1971C2', 'Green': '#2F9E44', 'Yellow': '#F59F00',
  'Orange': '#E8590C', 'Purple': '#7048E8', 'Pink': '#E64980',
  'Brown': '#8B4513', 'Gray': '#868E96', 'Silver': '#CED4DA',
  'Gold': '#D4A574', 'Navy': '#1864AB', 'Teal': '#0B7285',
  'Cream': '#FFF9DB', 'Beige': '#F5F5DC', 'Rose': '#C2255C',
  'Maroon': '#9C1414', 'Olive': '#6C6B14', 'Rainbow': 'linear-gradient(135deg, red, orange, yellow, green, blue, purple)',
  'Dark Brown': '#5C3317', 'Walnut': '#7B3F00', 'Cherry': '#9B1B30',
  'Mahogany': '#C04000', 'Briar': '#8B6914', 'Crystal': '#B2EBF2',
  'Acrylic': '#E8F5E9', 'Carbon Fiber': '#2C2C2C', 'Metal': '#8D9DB6',
  'Ceramic': '#F5F0E8', 'Wood': '#DEB887', 'Glass': '#E0F7FA',
  'Silicone': '#FF8FAB',
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const displayName = language === 'en' ? product.nameEn : product.name;
  const hasImage = product.image && !product.image.includes('placeholder');

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl cursor-pointer overflow-hidden border border-[#E8ECEF] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#1B4332]/20"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-[#F8F9FA]" style={{ aspectRatio: '3/4' }}>
        <img
          src={product.image}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x533/E8ECEF/ADB5BD?text=No+Image';
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[#1B4332]/0 group-hover:bg-[#1B4332]/10 transition-all duration-300" />

        {/* Brand Badge */}
        <div
          className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-[#1B4332] uppercase tracking-wider"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
        >
          {product.brand}
        </div>

        {/* View button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div
            className="w-9 h-9 bg-[#1B4332] rounded-full flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(27,67,50,0.4)' }}
          >
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-semibold text-[#212529] mb-1 line-clamp-2 group-hover:text-[#1B4332] transition-colors text-sm leading-snug"
          style={{ minHeight: '2.5rem' }}
        >
          {displayName}
        </h3>

        {/* SKU */}
        <p className="text-[10px] text-[#ADB5BD] mb-2.5 font-mono tracking-wider">
          {product.sku}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <p
            className="text-lg font-bold text-[#1B4332]"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            ${product.price.toFixed(2)}
          </p>

          {/* Color dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 5).map((color) => {
                const bg = colorMap[color] || color;
                const isGradient = bg.includes('gradient');
                const isLight = ['White', 'Cream', 'Beige', 'Crystal', 'Acrylic'].includes(color);
                return (
                  <span
                    key={color}
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{
                      background: isGradient ? bg : undefined,
                      backgroundColor: isGradient ? undefined : bg,
                      border: isLight ? '1px solid #DEE2E6' : '1px solid rgba(0,0,0,0.06)',
                    }}
                    title={color}
                  />
                );
              })}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-[#ADB5BD] font-medium ml-0.5">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

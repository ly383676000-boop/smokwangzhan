import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme } = useTheme();

  const displayName = language === 'en' ? product.nameEn : product.name;
  const hasImage = product.image && !product.image.includes('placeholder');
  // Find color option from variantOptions
  const colorOption = product.variantOptions?.find(o => 
    o.nameEn?.toLowerCase().includes('color') || o.name?.includes('颜色') || o.name?.includes('色彩')
  );
  const colorOptions = colorOption?.values || [];

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
      }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA' }}>
        <img
          src={product.image}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400/E8ECEF/ADB5BD?text=No+Image';
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.overlayColor}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        />

        {/* Brand Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
          style={{
            backgroundColor: theme.name === 'graffiti' ? 'rgba(255,107,53,0.9)' : 'rgba(255,255,255,0.95)',
            color: theme.name === 'graffiti' ? '#FFFFFF' : '#1B4332',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          {product.brand}
        </div>

        {/* View button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.addBtnBg, boxShadow: `0 2px 8px ${theme.addBtnBg}66` }}
          >
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-semibold mb-1 line-clamp-2 transition-colors text-sm leading-snug"
          style={{ minHeight: '2.5rem', color: theme.cardText }}
        >
          {displayName}
        </h3>

        {/* SKU */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold font-mono tracking-wider" style={{
            color: theme.name === 'graffiti' ? '#FF6B35' : '#FFFFFF',
            backgroundColor: theme.name === 'graffiti' ? 'rgba(255,107,53,0.18)' : '#1B4332',
            border: `1.5px solid ${theme.name === 'graffiti' ? 'rgba(255,107,53,0.4)' : 'rgba(27,67,50,0.5)'}`,
          }}>
            {product.sku}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <p
            className="text-lg font-bold"
            style={{ fontFamily: "'Roboto Mono', monospace", color: theme.cardPrice }}
          >
            ${product.price.toFixed(2)}
          </p>

          {/* Color text labels - always in DOM, visibility controlled by CSS */}
          <div
            className="flex items-center gap-1 flex-wrap"
            style={{ display: colorOptions.length > 0 ? 'flex' : 'none' }}
          >
            {colorOptions.slice(0, 3).map((color) => (
              <span
                key={color}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  color: theme.name === 'graffiti' ? '#888' : '#868E96',
                  backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F1F3F5',
                }}
              >
                {color}
              </span>
            ))}
            <span
              className="text-[10px] font-medium"
              style={{
                color: theme.name === 'graffiti' ? '#555' : '#ADB5BD',
                display: colorOptions.length > 3 ? 'inline' : 'none',
              }}
            >
              +{colorOptions.length - 3}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

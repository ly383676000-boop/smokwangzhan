import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Heart, Share2, Tag, Package, Box } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import VariantSelector from './VariantSelector';
import QuantitySelector from './QuantitySelector';
import { Product, ProductVariant } from '../types';
import { fetchProduct, mapApiProduct } from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const { theme } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [boxes, setBoxes] = useState(1);
  const [variants, setVariants] = useState<ProductVariant>({ notes: '' });
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const apiProduct = await fetchProduct(Number(id));
      const mapped = mapApiProduct(apiProduct);
      setProduct(mapped);
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-2xl animate-pulse" style={{ background: theme.name === 'graffiti' ? 'linear-gradient(to bottom right, #1A1A1A, #2A2A2A)' : 'linear-gradient(to bottom right, #F0F2F4, #E8ECEF)' }} />
            <div className="flex gap-3">
              {[1,2,3].map(i => <div key={i} className="w-20 h-20 rounded-xl animate-pulse" style={{ backgroundColor: theme.filterBorder }} />)}
            </div>
          </div>
          <div className="space-y-5 pt-4">
            <div className="h-5 rounded-full animate-pulse w-1/4" style={{ backgroundColor: theme.filterBorder }} />
            <div className="h-8 rounded-full animate-pulse w-4/5" style={{ backgroundColor: theme.filterBorder }} />
            <div className="h-8 rounded-full animate-pulse w-3/5" style={{ backgroundColor: theme.filterBorder }} />
            <div className="h-10 rounded-full animate-pulse w-1/3" style={{ backgroundColor: theme.filterBorder }} />
            <div className="space-y-2 pt-4">
              {[1,2,3].map(i => <div key={i} className="h-4 rounded-full animate-pulse" style={{ backgroundColor: theme.filterBorder }} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA' }}>
          <Package className="w-8 h-8" style={{ color: theme.name === 'graffiti' ? '#444' : '#DEE2E6' }} />
        </div>
        <p className="text-lg mb-4" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>{t.home.productNotFound}</p>
        <button onClick={() => navigate('/')} className="px-7 py-3.5 rounded-lg font-semibold text-white" style={{ backgroundColor: theme.btnPrimary, fontFamily: 'Poppins, sans-serif' }}>
          {t.home.backToHome}
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const options = (product.variantOptions || []).filter(opt => opt.values && opt.values.length > 0);

  // Check if all required options are selected
  const isVariantComplete = options.every(opt => variants[opt.name]);

  const handleAddToCart = () => {
    if (!isVariantComplete) return;
    addItem(product, variants, boxes);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors group"
        style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}
      >
        <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.filterBorder}` }}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        <span className="font-medium">{t.product.backToProducts}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* ── Left: Image Gallery ── */}
        <div className="space-y-4 max-w-md mx-auto lg:mx-0">
          {/* Main Image */}
          <div
            className="aspect-square rounded-2xl overflow-hidden"
            style={{
              backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA',
              border: `1px solid ${theme.filterBorder}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={images[selectedImage]}
              alt={language === 'en' ? product.nameEn : product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/600x750/E8ECEF/ADB5BD?text=No+Image';
              }}
            />
          </div>

          {/* Thumbnails - always in DOM, visibility controlled by CSS */}
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ display: images.length > 1 ? 'flex' : 'none' }}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200`}
                style={{
                  borderColor: selectedImage === idx ? theme.filterActive : 'transparent',
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/72x72/E8ECEF/ADB5BD?text=No';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Product Info ── */}
        <div className="space-y-6">
          {/* Brand + SKU */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="px-3 py-1.5 text-xs font-bold text-white rounded-lg tracking-wider uppercase"
              style={{ background: theme.productTagBg, color: theme.productTagText }}
            >
              {product.brand}
            </span>
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold font-mono tracking-wider" style={{
              color: theme.name === 'graffiti' ? '#FF6B35' : '#FFFFFF',
              backgroundColor: theme.name === 'graffiti' ? 'rgba(255,107,53,0.18)' : '#1B4332',
              border: `1.5px solid ${theme.name === 'graffiti' ? 'rgba(255,107,53,0.4)' : 'rgba(27,67,50,0.5)'}`,
            }}>
              <Tag className="w-4 h-4" />
              {product.sku}
            </span>
          </div>

          {/* Name */}
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold leading-tight mb-1"
              style={{ fontFamily: 'Poppins, sans-serif', color: theme.cardText }}
            >
              {language === 'en' ? product.nameEn : product.name}
            </h1>
            <p
              className="text-sm"
              style={{
                color: theme.name === 'graffiti' ? '#555' : '#ADB5BD',
                display: (language === 'en' && product.name !== product.nameEn) ? 'block' : 'none',
              }}
            >
              {product.name}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-4xl font-bold"
              style={{ fontFamily: "'Roboto Mono', monospace", color: theme.cardPrice }}
            >
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>/ {language === 'en' ? 'unit' : '件'}</span>
          </div>

          {/* Box Info */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA', border: `1px solid ${theme.filterBorder}` }}
          >
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5" style={{ color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332' }} />
              <span className="text-sm font-semibold" style={{ color: theme.cardText }}>
                {language === 'en' ? 'Per Carton' : '每箱数量'}
              </span>
            </div>
            <span
              className="px-3 py-1 rounded-lg text-base font-bold"
              style={{ backgroundColor: theme.name === 'graffiti' ? '#39FF14' : '#1B4332', color: '#FFFFFF', fontFamily: "'Roboto Mono', monospace" }}
            >
              {product.boxQty || 1} {language === 'en' ? 'pcs' : '件/箱'}
            </span>
          </div>

          {/* Description */}
          {(product.description || product.descriptionEn) && (
            <div className="rounded-xl p-4" style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA', border: `1px solid ${theme.filterBorder}` }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                {t.product.details}
              </h2>
              <p className="leading-relaxed text-sm" style={{ color: theme.name === 'graffiti' ? '#AAA' : '#495057' }}>
                {language === 'en' ? product.descriptionEn : product.description}
              </p>
            </div>
          )}

          {/* Variant Selector */}
          {options.length > 0 && (
            <div className="rounded-xl p-5" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.filterBorder}` }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                {language === 'en' ? 'Options & Customization' : '规格与定制'}
              </h2>
              <VariantSelector
                variants={variants}
                onChange={setVariants}
                options={options}
              />
            </div>
          )}

          {/* Quantity - Box based */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.filterBorder}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold" style={{ color: theme.cardText }}>
                {language === 'en' ? 'Order Quantity' : '订购数量'}
              </label>
              <span className="text-xs" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                {language === 'en' ? 'Enter number of cartons' : '输入箱数'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap" style={{ color: theme.name === 'graffiti' ? '#AAA' : '#6C757D' }}>
                {language === 'en' ? 'Cartons' : '箱数'}
              </label>
              <QuantitySelector
                value={boxes}
                onChange={(val: number) => {
                  setBoxes(val);
                  setQuantity(val * (product.boxQty || 1));
                }}
              />
            </div>
            <div
              className="mt-3 px-4 py-2.5 rounded-lg text-center"
              style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F0FDF4', border: `1px solid ${theme.name === 'graffiti' ? '#333' : '#BBF7D0'}` }}
            >
              <span className="text-xs" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
                {language === 'en' ? 'Total' : '合计'}
              </span>
              <span
                className="ml-2 text-lg font-bold"
                style={{ fontFamily: "'Roboto Mono', monospace", color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332' }}
              >
                {quantity} {language === 'en' ? 'units' : '件'}
              </span>
              <span className="text-xs ml-1" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                ({boxes} {language === 'en' ? 'carton(s)' : '箱'} × {product.boxQty || 1})
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={options.length > 0 && !isVariantComplete}
              className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: (options.length > 0 && !isVariantComplete)
                  ? (theme.name === 'graffiti' ? '#2A2A2A' : '#E8ECEF')
                  : addedToCart
                  ? '#22C55E'
                  : theme.addBtnBg,
                color: (options.length > 0 && !isVariantComplete)
                  ? (theme.name === 'graffiti' ? '#555' : '#ADB5BD')
                  : '#FFFFFF',
                cursor: (options.length > 0 && !isVariantComplete) ? 'not-allowed' : 'pointer',
              }}
            >
              {/* Always render both icons, toggle visibility with CSS to avoid Fragment insertBefore errors */}
              <Check className="w-6 h-6" style={{ display: addedToCart ? 'block' : 'none' }} />
              <ShoppingCart className="w-6 h-6" style={{ display: addedToCart ? 'none' : 'block' }} />
              <span>{addedToCart ? t.product.addedToCart : t.product.addToCart}</span>
            </button>

            <p
              className="text-xs text-center"
              style={{
                color: theme.name === 'graffiti' ? '#555' : '#ADB5BD',
                display: (options.length > 0 && !isVariantComplete) ? 'block' : 'none',
              }}
            >
              {t.product.selectAllOptions}
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-5 pt-1" style={{ borderTop: `1px solid ${theme.filterBorder}` }}>
            <button className="flex items-center gap-2 transition-colors" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
              <Heart className="w-4 h-4" />
              <span className="text-sm">{t.product.wishlist}</span>
            </button>
            <button className="flex items-center gap-2 transition-colors" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{t.product.share}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

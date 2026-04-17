import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Heart, Share2, Tag, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import VariantSelector from './VariantSelector';
import QuantitySelector from './QuantitySelector';
import { Product, ProductVariant } from '../types';
import { fetchProduct, mapApiProduct } from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState<ProductVariant>({
    color: '',
    size: '',
    specification: '',
    material: '',
    custom1: { name: '', value: '' },
    custom2: { name: '', value: '' },
    custom3: { name: '', value: '' },
    notes: '',
  });
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const apiProduct = await fetchProduct(Number(id));
      const mapped = mapApiProduct(apiProduct);
      setProduct(mapped);
      setVariants(prev => ({
        ...prev,
        custom1: mapped.custom1_name ? { name: mapped.custom1_name, value: '' } : { name: '', value: '' },
        custom2: mapped.custom2_name ? { name: mapped.custom2_name, value: '' } : { name: '', value: '' },
        custom3: mapped.custom3_name ? { name: mapped.custom3_name, value: '' } : { name: '', value: '' },
      }));
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gradient-to-br from-[#F0F2F4] to-[#E8ECEF] rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[1,2,3].map(i => <div key={i} className="w-20 h-20 bg-[#F0F2F4] rounded-xl animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-5 pt-4">
            <div className="h-5 bg-[#F0F2F4] rounded-full animate-pulse w-1/4" />
            <div className="h-8 bg-[#F0F2F4] rounded-full animate-pulse w-4/5" />
            <div className="h-8 bg-[#F0F2F4] rounded-full animate-pulse w-3/5" />
            <div className="h-10 bg-[#F0F2F4] rounded-full animate-pulse w-1/3" />
            <div className="space-y-2 pt-4">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-[#F0F2F4] rounded-full animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-[#DEE2E6]" />
        </div>
        <p className="text-[#6C757D] text-lg mb-4">{t.home.productNotFound}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t.home.backToHome}
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isVariantComplete =
    (!product.colors.length || variants.color) &&
    (!product.sizes.length || variants.size) &&
    (!product.specifications.length || variants.specification) &&
    (!product.materials.length || variants.material);

  const handleAddToCart = () => {
    if (!isVariantComplete) return;
    addItem(product, variants, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm text-[#6C757D] hover:text-[#1B4332] mb-8 transition-colors group"
      >
        <span className="w-7 h-7 bg-white rounded-lg border border-[#E8ECEF] flex items-center justify-center group-hover:border-[#1B4332]/30 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        <span className="font-medium">{t.product.backToProducts}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* ── Left: Image Gallery ── */}
        <div className="space-y-4">
          {/* Main Image */}
          <div
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#F8F9FA] border border-[#E8ECEF]"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
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

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === idx
                      ? 'border-[#1B4332] shadow-md'
                      : 'border-transparent hover:border-[#ADB5BD]'
                  }`}
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
          )}
        </div>

        {/* ── Right: Product Info ── */}
        <div className="space-y-6">
          {/* Brand + SKU */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="px-3 py-1.5 text-xs font-bold text-white rounded-lg tracking-wider uppercase"
              style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}
            >
              {product.brand}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#ADB5BD] font-mono">
              <Tag className="w-3 h-3" />
              {product.sku}
            </span>
          </div>

          {/* Name */}
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold text-[#212529] leading-tight mb-1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {language === 'en' ? product.nameEn : product.name}
            </h1>
            {language === 'en' && product.name !== product.nameEn && (
              <p className="text-sm text-[#ADB5BD]">{product.name}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-4xl font-bold text-[#1B4332]"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-[#ADB5BD]">/ {language === 'en' ? 'unit' : '件'}</span>
          </div>

          {/* Description */}
          {(product.description || product.descriptionEn) && (
            <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E8ECEF]">
              <h2 className="text-xs font-semibold text-[#ADB5BD] uppercase tracking-wider mb-2">
                {t.product.details}
              </h2>
              <p className="text-[#495057] leading-relaxed text-sm">
                {language === 'en' ? product.descriptionEn : product.description}
              </p>
            </div>
          )}

          {/* Variant Selector */}
          <div className="bg-white rounded-xl p-5 border border-[#E8ECEF]">
            <h2 className="text-xs font-semibold text-[#ADB5BD] uppercase tracking-wider mb-4">
              {language === 'en' ? 'Options & Customization' : '规格与定制'}
            </h2>
            <VariantSelector
              variants={variants}
              onChange={setVariants}
              product={{
                colors: product.colors,
                sizes: product.sizes,
                specifications: product.specifications,
                materials: product.materials,
                custom1_name: product.custom1_name,
                custom1_values: product.custom1_values,
                custom2_name: product.custom2_name,
                custom2_values: product.custom2_values,
                custom3_name: product.custom3_name,
                custom3_values: product.custom3_values,
              }}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-6">
            <label className="text-sm font-semibold text-[#212529] whitespace-nowrap">
              {t.product.quantity}
            </label>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>

          {/* Add to Cart */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!isVariantComplete}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-200 ${
                !isVariantComplete
                  ? 'bg-[#E8ECEF] text-[#ADB5BD] cursor-not-allowed'
                  : addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  {t.product.addedToCart}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  {t.product.addToCart}
                </>
              )}
            </button>

            {!isVariantComplete && (
              <p className="text-xs text-[#ADB5BD] text-center">
                {t.product.selectAllOptions}
              </p>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-5 pt-1 border-t border-[#E8ECEF]">
            <button className="flex items-center gap-2 text-[#6C757D] hover:text-[#1B4332] transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{t.product.wishlist}</span>
            </button>
            <button className="flex items-center gap-2 text-[#6C757D] hover:text-[#1B4332] transition-colors">
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

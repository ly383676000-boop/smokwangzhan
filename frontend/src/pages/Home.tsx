import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import { Product } from '../types';
import { fetchProducts, mapApiProduct } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Search, Package } from 'lucide-react';

const Home: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // 调试日志
  console.log('🏠 Home render - settings:', settings);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const apiProducts = await fetchProducts();
      const mapped = apiProducts.map(mapApiProduct);
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query ||
      product.name.toLowerCase().includes(query) ||
      product.nameEn.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bodyBg }}>
      <Header onCartClick={() => setCartOpen(true)} onSearch={setSearchQuery} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: theme.heroBg }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${theme.heroAccent}, transparent)` }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${theme.name === 'graffiti' ? '#39FF14' : '#40916C'}, transparent)` }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5" style={{ background: `radial-gradient(circle, ${theme.heroAccent}, transparent)` }} />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-16 lg:py-28">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.badgeText }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: theme.badgeText }}>
              {language === 'en' ? 'Manufacturer & Supplier' : '制造商 · 供应商'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-6">
            {/* Left: Title + Stats */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.15] mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: theme.heroText }}>
                China One-Stop
                <br />
                <span style={{ color: theme.heroAccent }}>Smoking Accessories</span>
                <br />
                Wholesale & Manufacturing
              </h1>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 lg:gap-10">
                {[
                  { num: '500+', label: language === 'en' ? 'SKUs' : '产品型号' },
                  { num: '20+', label: language === 'en' ? 'Categories' : '产品分类' },
                  { num: '50+', label: language === 'en' ? 'Countries' : '覆盖国家' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl lg:text-2xl font-bold" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.heroAccent }}>
                      {stat.num}
                    </div>
                    <div className="text-xs lg:text-sm mt-0.5 font-medium" style={{ color: theme.name === 'graffiti' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: DDP subtitle */}
            <div className="lg:max-w-sm flex-shrink-0 lg:pt-0.5">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-2 whitespace-nowrap" style={{ color: theme.heroText, fontFamily: 'Poppins, sans-serif' }}>
                DDP Delivery <span style={{ color: theme.heroAccent }}>|</span> EU & US
              </div>
              <div className="text-sm sm:text-base lg:text-lg whitespace-nowrap" style={{ color: theme.name === 'graffiti' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)', fontFamily: 'Poppins, sans-serif' }}>
                Door-to-Door, Duty Paid
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-8">

        {/* Filter & Search Bar */}
        <div className="rounded-2xl shadow-sm mb-8 overflow-hidden" style={{ backgroundColor: theme.filterBg, border: `1px solid ${theme.filterBorder}` }}>
          {/* Category Tabs */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !selectedCategory ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: !selectedCategory ? theme.filterActive : 'transparent',
                color: !selectedCategory ? theme.filterActiveText : theme.name === 'graffiti' ? '#888' : '#6C757D',
              }}
            >
              {language === 'en' ? 'All Products' : '全部'}
              {!loading && (
                <span className="ml-1.5 text-xs" style={{ color: !selectedCategory ? 'rgba(255,255,255,0.7)' : theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                  {products.length}
                </span>
              )}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? theme.filterActive : 'transparent',
                  color: selectedCategory === cat ? theme.filterActiveText : theme.name === 'graffiti' ? '#888' : '#6C757D',
                }}
              >
                {cat}
                <span className="ml-1.5 text-xs" style={{ color: selectedCategory === cat ? 'rgba(255,255,255,0.7)' : theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                  {products.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Divider + Search row */}
          <div className="px-5 py-3 flex items-center justify-between gap-4" style={{ borderTop: `1px solid ${theme.filterBorder}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
              <Package className="w-4 h-4" />
              <span>
                {loading ? (
                  <span style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>{language === 'en' ? 'Loading...' : '加载中...'}</span>
                ) : (
                  <>
                    <span className="font-semibold" style={{ color: theme.cardText }}>{filteredProducts.length}</span>
                    {' '}{language === 'en' ? 'products' : '款产品'}
                    {selectedCategory && <span className="font-medium" style={{ color: theme.filterActive }}> · {selectedCategory}</span>}
                  </>
                )}
              </span>
            </div>
            {/* Mobile search */}
            <div className="flex md:hidden flex-1 max-w-[200px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                <input
                  type="text"
                  placeholder={t.nav.search}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg placeholder-[#ADB5BD] focus:outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA',
                    color: theme.name === 'graffiti' ? '#E0E0E0' : '#212529',
                    border: `1px solid ${theme.filterBorder}`,
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div id="products" className="mb-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: theme.cardBg }}>
                  <div className="aspect-[3/4] animate-pulse" style={{ background: theme.name === 'graffiti' ? 'linear-gradient(to bottom right, #1A1A1A, #2A2A2A)' : 'linear-gradient(to bottom right, #F0F0F0, #E8E8E8)' }} />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3 rounded-full animate-pulse w-4/5" style={{ backgroundColor: theme.filterBorder }} />
                    <div className="h-3 rounded-full animate-pulse w-3/5" style={{ backgroundColor: theme.filterBorder }} />
                    <div className="h-5 rounded-full animate-pulse w-2/5 mt-1" style={{ backgroundColor: theme.filterBorder }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.filterBorder}` }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA' }}>
                <Search className="w-7 h-7" style={{ color: theme.name === 'graffiti' ? '#444' : '#DEE2E6' }} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: theme.cardText }}>{t.home.noProducts}</h3>
              <p className="text-sm" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>{t.home.noProductsHint}</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                className="mt-4 text-sm font-medium hover:underline"
                style={{ color: theme.filterActive }}
              >
                {language === 'en' ? 'Clear filters' : '清除筛选'}
              </button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🚚', title: t.home.featureShipping, desc: t.home.featureShippingDesc },
            { icon: '🏆', title: t.home.featureQuality, desc: t.home.featureQualityDesc },
            { icon: '🤝', title: t.home.featureSupport, desc: t.home.featureSupportDesc },
            { icon: '💰', title: t.home.featureWholesale, desc: t.home.featureWholesaleDesc },
          ].map((feat, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 text-center transition-all duration-200"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.filterBorder}`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl"
                style={{ background: theme.sectionIconBg }}
              >
                {feat.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: theme.cardText }}>
                {feat.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: theme.footerBg }} id="contact">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.name === 'graffiti' ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.1)' }}>
                  <span className="font-bold text-sm" style={{ color: theme.name === 'graffiti' ? '#FF6B35' : '#FFFFFF' }}>HC</span>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '1px', color: theme.footerText }}>
                    {language === 'en' 
                      ? (settings?.company_name || 'Company Name') 
                      : (settings?.company_name_zh || settings?.company_name || '公司名称')}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: theme.name === 'graffiti' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)' }}>
                {language === 'en'
                  ? 'Premium smoking accessories wholesale platform serving global retailers and distributors.'
                  : '专业烟具批发平台，为全球零售商和分销商提供优质产品服务。'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: theme.footerText }}>
                {t.footer.quickLinks}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: t.footer.allProducts, href: '#products' },
                  { label: t.footer.newArrivals, href: '#' },
                  { label: t.footer.bestSellers, href: '#' },
                  { label: t.footer.wholesale, href: '#contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200 flex items-center gap-2"
                      style={{ color: theme.name === 'graffiti' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)' }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.footerAccent, opacity: 0.5 }} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: theme.footerText }}>
                {t.footer.contactUs}
              </h4>
              <ul className="space-y-3">
                {settings?.whatsapp && (
                  <li key="whatsapp" className="flex items-start gap-3">
                    <span className="text-lg">📱</span>
                    <div>
                      <span className="text-sm" style={{ color: theme.footerAccent, opacity: 0.8 }}>WhatsApp</span>
                      <p className="font-medium" style={{ color: theme.footerAccent }}>{settings.whatsapp}</p>
                    </div>
                  </li>
                )}
                {settings?.phone && (
                  <li key="phone" className="flex items-start gap-3">
                    <span className="text-lg">📞</span>
                    <div>
                      <span className="text-sm" style={{ color: theme.footerAccent, opacity: 0.8 }}>Phone</span>
                      <p className="font-medium" style={{ color: theme.footerAccent }}>{settings.phone}</p>
                    </div>
                  </li>
                )}
                {settings?.email && (
                  <li key="email" className="flex items-start gap-3">
                    <span className="text-lg">📧</span>
                    <div>
                      <span className="text-sm" style={{ color: theme.footerAccent, opacity: 0.8 }}>Email</span>
                      <p className="font-medium" style={{ color: theme.footerAccent }}>{settings.email}</p>
                    </div>
                  </li>
                )}
                {settings?.address && (
                  <li key="address" className="flex items-start gap-3">
                    <span className="text-lg">📍</span>
                    <div>
                      <span className="text-sm" style={{ color: theme.footerAccent, opacity: 0.8 }}>Address</span>
                      <p className="font-medium" style={{ color: theme.footerAccent }}>{settings.address}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              © 2026 {language === 'en' 
                ? (settings?.company_name || 'Company Name') 
                : (settings?.company_name_zh || settings?.company_name || '公司名称')}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {language === 'en' ? 'All Rights Reserved' : '版权所有'}
            </p>
          </div>
        </div>
      </footer>

      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Home;

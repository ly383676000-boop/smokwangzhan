import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import { Product } from '../types';
import { fetchProducts, mapApiProduct } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Search, Package } from 'lucide-react';

const Home: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

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
    <div className="min-h-screen" style={{ backgroundColor: '#F4F6F8' }}>
      <Header onCartClick={() => setCartOpen(true)} onSearch={setSearchQuery} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D2B1E 0%, #1B4332 50%, #2D6A4F 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4A574, transparent)' }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #40916C, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #D4A574, transparent)' }} />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(212,165,116,0.15)', border: '1px solid rgba(212,165,116,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A574] animate-pulse" />
              <span className="text-[#D4A574] text-xs font-semibold tracking-widest uppercase">
                Premium Wholesale
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'en' ? (
                <>Global Smoking<br /><span className="text-[#D4A574]">Accessories</span></>
              ) : (
                <>全球烟具<br /><span className="text-[#D4A574]">批发平台</span></>
              )}
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg">
              {language === 'en'
                ? '500+ premium SKUs across 20 categories. Fast worldwide shipping with professional B2B support.'
                : '覆盖20大品类、500+ SKU 的优质烟具产品，专业B2B批发服务，快速全球发货'}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { num: '500+', label: language === 'en' ? 'SKUs' : '产品型号' },
                { num: '20+', label: language === 'en' ? 'Categories' : '产品分类' },
                { num: '50+', label: language === 'en' ? 'Countries' : '覆盖国家' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-[#D4A574]" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                    {stat.num}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8">

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECEF] mb-8 overflow-hidden">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'text-[#6C757D] hover:text-[#1B4332] hover:bg-[#F8F9FA]'
              }`}
            >
              {language === 'en' ? 'All Products' : '全部'}
              {!loading && (
                <span className={`ml-1.5 text-xs ${!selectedCategory ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
                  {products.length}
                </span>
              )}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#6C757D] hover:text-[#1B4332] hover:bg-[#F8F9FA]'
                }`}
              >
                {cat}
                <span className={`ml-1.5 text-xs ${selectedCategory === cat ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
                  {products.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Divider + Search row */}
          <div className="border-t border-[#F0F2F4] px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#6C757D]">
              <Package className="w-4 h-4" />
              <span>
                {loading ? (
                  <span className="text-[#ADB5BD]">{language === 'en' ? 'Loading...' : '加载中...'}</span>
                ) : (
                  <>
                    <span className="font-semibold text-[#212529]">{filteredProducts.length}</span>
                    {' '}{language === 'en' ? 'products' : '款产品'}
                    {selectedCategory && <span className="text-[#1B4332] font-medium"> · {selectedCategory}</span>}
                  </>
                )}
              </span>
            </div>
            {/* Mobile search (visible on small screens when Header search is hidden) */}
            <div className="flex md:hidden flex-1 max-w-[200px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                <input
                  type="text"
                  placeholder={t.nav.search}
                  className="w-full pl-9 pr-3 py-1.5 border border-[#E8ECEF] rounded-lg text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm bg-[#F8F9FA]"
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
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#F0F0F0] to-[#E8E8E8] animate-pulse" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3 bg-[#F0F0F0] rounded-full animate-pulse w-4/5" />
                    <div className="h-3 bg-[#F0F0F0] rounded-full animate-pulse w-3/5" />
                    <div className="h-5 bg-[#F0F0F0] rounded-full animate-pulse w-2/5 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E8ECEF]">
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-[#DEE2E6]" />
              </div>
              <h3 className="text-base font-semibold text-[#212529] mb-1">{t.home.noProducts}</h3>
              <p className="text-sm text-[#6C757D]">{t.home.noProductsHint}</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                className="mt-4 text-sm text-[#1B4332] font-medium hover:underline"
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
              className="bg-white rounded-2xl p-5 text-center border border-[#E8ECEF] hover:border-[#1B4332]/20 hover:shadow-md transition-all duration-200"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl"
                style={{ background: 'linear-gradient(135deg, #f0f7f4, #e8f5ef)' }}
              >
                {feat.icon}
              </div>
              <h3 className="font-semibold text-[#212529] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {feat.title}
              </h3>
              <p className="text-xs text-[#6C757D] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0D2B1E] text-white" id="contact">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HC</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '1px' }}>
                    HONG KONG COOKIES
                  </div>
                  <div className="text-[#D4A574] text-[10px] tracking-[3px]">TRADING LIMITED</div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {language === 'en'
                  ? 'Premium smoking accessories wholesale platform serving global retailers and distributors.'
                  : '专业烟具批发平台，为全球零售商和分销商提供优质产品服务。'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                      className="text-white/50 hover:text-[#D4A574] text-sm transition-colors duration-200 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4A574]/50" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {t.footer.contactUs}
              </h4>
              <ul className="space-y-3">
                {[
                  { icon: '📱', label: 'WhatsApp', val: '+852 1234 5678' },
                  { icon: '📧', label: 'Email', val: 'info@hkcookies.com' },
                  { icon: '📍', label: 'Address', val: 'Hong Kong SAR' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-[#D4A574] text-xs font-medium">{item.label}</div>
                      <div className="text-white/50 text-sm">{item.val}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">{t.footer.copyright}</p>
            <p className="text-white/20 text-xs">
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

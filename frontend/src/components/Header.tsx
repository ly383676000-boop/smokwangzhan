import React, { useState } from 'react';
import { Search, ShoppingCart, Globe, Menu, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onSearch, onCategoryFilter }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <header className="bg-[#1B4332] sticky top-0 z-50" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">HC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-base leading-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '2px' }}>
                HONG KONG COOKIES
              </h1>
              <p className="text-[#D4A574] text-xs" style={{ letterSpacing: '3px' }}>TRADING LIMITED</p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: t.nav.home, href: '#', active: true },
              { label: t.nav.products, href: '#products', active: false },
              { label: t.nav.about, href: '#about', active: false },
              { label: t.nav.contact, href: '#contact', active: false },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-white text-sm font-medium hover:text-[#D4A574] transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
                {link.active && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#D4A574]" />
                )}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-[320px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                <input
                  type="text"
                  placeholder={t.nav.search}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#D4A574] border-0 text-sm"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
            </div>

            {/* Language Switch */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {language === 'en' ? 'EN' : '中文'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg py-1 z-50 min-w-[140px] animate-fadeIn" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <button
                      onClick={() => { toggleLanguage(); setLangDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#495057] hover:bg-[#F8F9FA] flex items-center gap-2"
                    >
                      {language === 'zh' && <span className="text-[#D4A574]">✓</span>}
                      English
                    </button>
                    <button
                      onClick={() => { if (language === 'en') toggleLanguage(); setLangDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#495057] hover:bg-[#F8F9FA] flex items-center gap-2"
                    >
                      {language === 'zh' && <span className="text-[#D4A574]">✓</span>}
                      中文 (简体)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2.5 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label={t.cart.title}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4A574] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-badge-bounce" style={{ minWidth: '20px' }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
              <input
                type="text"
                placeholder={t.nav.search}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#D4A574] border-0 text-sm"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { label: t.nav.home, href: '#' },
                { label: t.nav.products, href: '#products' },
                { label: t.nav.about, href: '#about' },
                { label: t.nav.contact, href: '#contact' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

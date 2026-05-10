import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingCart, Globe, Menu, X, ChevronDown, Palette } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  onCartClick: () => void;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onSearch, onCategoryFilter }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { getItemCount } = useCart();
  const { theme, themeName, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const companyName = language === 'en' 
    ? (settings?.company_name || 'Company Name') 
    : (settings?.company_name_zh || settings?.company_name || '公司名称');

  return (
    <header style={{ backgroundColor: theme.headerBg, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} className="sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-20">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.name === 'graffiti' ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.1)' }}>
              <span className="font-bold text-lg" style={{ color: theme.name === 'graffiti' ? '#FF6B35' : '#FFFFFF' }}>HC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-base leading-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '2px', color: theme.headerText }}>
                {companyName}
              </h1>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: t.nav.home, target: 'home', active: true },
              { label: t.nav.products, target: 'products', active: false },
              { label: t.nav.about, target: 'about', active: false },
              { label: t.nav.contact, target: 'contact', active: false },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      const el = link.target === 'home' ? null : document.getElementById(link.target);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  } else {
                    const el = link.target === 'home' ? null : document.getElementById(link.target);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="relative text-sm font-medium transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif', color: theme.headerText }}
                onMouseEnter={e => e.currentTarget.style.color = theme.headerAccent}
                onMouseLeave={e => e.currentTarget.style.color = theme.headerText}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 w-full h-0.5"
                  style={{
                    backgroundColor: link.active ? theme.headerAccent : 'transparent',
                  }}
                />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-[460px]">
              <div className="relative w-full flex items-center">
                <Search className="w-6 h-6 flex-shrink-0 mr-3" style={{ color: theme.headerAccent }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 rounded-xl placeholder-[#ADB5BD] focus:outline-none focus:ring-2 border-0 text-base"
                  style={{
                    backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#FFFFFF',
                    color: theme.name === 'graffiti' ? '#E0E0E0' : '#212529',
                    focusRingColor: theme.headerAccent,
                  }}
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg transition-colors"
              style={{ color: theme.headerText }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle theme"
              title={themeName === 'classic' ? 'Switch to Graffiti' : '切换到经典风格'}
            >
              <Palette className="w-5 h-5" />
            </button>

            {/* Language Switch */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors"
                style={{ color: theme.headerText }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {language === 'en' ? 'EN' : '中文'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {/* Language Dropdown - always in DOM, visibility controlled by CSS */}
              <div
                className="fixed inset-0 z-40"
                style={{ display: langDropdownOpen ? 'block' : 'none' }}
                onClick={() => setLangDropdownOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-2 rounded-lg shadow-lg py-1 z-50 min-w-[140px] animate-fadeIn"
                style={{
                  backgroundColor: theme.cardBg,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: langDropdownOpen ? 'block' : 'none',
                }}
              >
                <button
                  onClick={() => { toggleLanguage(); setLangDropdownOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors"
                  style={{ color: theme.cardText }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.name === 'graffiti' ? '#2A2A2A' : '#F8F9FA'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {language === 'zh' && <span style={{ color: theme.headerAccent }}>✓</span>}
                  English
                </button>
                <button
                  onClick={() => { if (language === 'en') toggleLanguage(); setLangDropdownOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors"
                  style={{ color: theme.cardText }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.name === 'graffiti' ? '#2A2A2A' : '#F8F9FA'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {language === 'zh' && <span style={{ color: theme.headerAccent }}>✓</span>}
                  中文 (简体)
                </button>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-3 rounded-lg transition-colors"
              style={{ color: theme.headerText }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label={t.cart.title}
            >
              <ShoppingCart className="w-7 h-7" />
              {/* Cart badge - always in DOM, visibility controlled by CSS to avoid insertBefore errors */}
              <span
                className="absolute -top-1.5 -right-1.5 text-white text-xs w-[22px] h-[22px] rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: theme.headerAccent,
                  minWidth: '20px',
                  display: itemCount > 0 ? 'flex' : 'none',
                }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: theme.headerText }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Logo Image - Right side */}
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            style={{ flexShrink: 0, marginLeft: '12px' }}
          />
        </div>

        {/* Mobile Menu - always in DOM, visibility controlled by CSS */}
        <div
          className="md:hidden pb-4 animate-fadeIn space-y-3"
          style={{ display: mobileMenuOpen ? 'block' : 'none' }}
        >
          <div className="relative flex items-center">
            <Search className="w-6 h-6 flex-shrink-0 mr-3" style={{ color: theme.headerAccent }} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-3 rounded-xl placeholder-[#ADB5BD] focus:outline-none focus:ring-2 border-0 text-base"
              style={{
                backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#FFFFFF',
                color: theme.name === 'graffiti' ? '#E0E0E0' : '#212529',
              }}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          <nav className="flex flex-col gap-1">
            {[
              { label: t.nav.home, target: 'home' },
              { label: t.nav.products, target: 'products' },
              { label: t.nav.about, target: 'about' },
              { label: t.nav.contact, target: 'contact' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (window.location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      const el = link.target === 'home' ? null : document.getElementById(link.target);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  } else {
                    const el = link.target === 'home' ? null : document.getElementById(link.target);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="px-3 py-2 rounded-lg transition-colors text-sm text-left"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

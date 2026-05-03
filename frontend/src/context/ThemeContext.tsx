import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeName = 'classic' | 'graffiti';

interface ThemeColors {
  name: ThemeName;
  headerBg: string;
  headerText: string;
  headerAccent: string;
  heroBg: string;
  heroAccent: string;
  heroText: string;
  heroSubtext: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  btnPrimary: string;
  btnPrimaryHover: string;
  btnAccent: string;
  btnAccentHover: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardText: string;
  cardPrice: string;
  cardBrandBadge: string;
  footerBg: string;
  footerText: string;
  footerAccent: string;
  bodyBg: string;
  filterBg: string;
  filterBorder: string;
  filterActive: string;
  filterActiveText: string;
  overlayColor: string;
  cartHeaderBg: string;
  cartAccent: string;
  sectionIconBg: string;
  productTagBg: string;
  productTagText: string;
  addBtnBg: string;
  addBtnHover: string;
}

const classicTheme: ThemeColors = {
  name: 'classic',
  headerBg: '#1B4332',
  headerText: '#E9D8B4',
  headerAccent: '#E9D8B4',
  heroBg: 'linear-gradient(135deg, #0D2B1E 0%, #1B4332 50%, #2D6A4F 100%)',
  heroAccent: '#D4A574',
  heroText: '#FFFFFF',
  heroSubtext: 'rgba(255,255,255,0.6)',
  badgeBg: 'rgba(212,165,116,0.15)',
  badgeBorder: 'rgba(212,165,116,0.3)',
  badgeText: '#D4A574',
  btnPrimary: '#1B4332',
  btnPrimaryHover: '#143728',
  btnAccent: '#D4A574',
  btnAccentHover: '#C9A227',
  cardBg: '#FFFFFF',
  cardBorder: '#E8ECEF',
  cardHoverBorder: 'rgba(27,67,50,0.2)',
  cardText: '#212529',
  cardPrice: '#1B4332',
  cardBrandBadge: '#1B4332',
  footerBg: '#0D2B1E',
  footerText: '#FFFFFF',
  footerAccent: '#D4A574',
  bodyBg: '#F4F6F8',
  filterBg: '#FFFFFF',
  filterBorder: '#E8ECEF',
  filterActive: '#1B4332',
  filterActiveText: '#FFFFFF',
  overlayColor: 'rgba(27,67,50,0.1)',
  cartHeaderBg: '#1B4332',
  cartAccent: '#D4A574',
  sectionIconBg: 'linear-gradient(135deg, #f0f7f4, #e8f5ef)',
  productTagBg: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
  productTagText: '#FFFFFF',
  addBtnBg: '#1B4332',
  addBtnHover: '#143728',
};

const graffitiTheme: ThemeColors = {
  name: 'graffiti',
  headerBg: '#0A0A0A',
  headerText: '#FFFFFF',
  headerAccent: '#FF6B35',
  heroBg: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #16213E 100%)',
  heroAccent: '#FF6B35',
  heroText: '#FFFFFF',
  heroSubtext: 'rgba(255,255,255,0.5)',
  badgeBg: 'rgba(255,107,53,0.15)',
  badgeBorder: 'rgba(255,107,53,0.4)',
  badgeText: '#FF6B35',
  btnPrimary: '#FF6B35',
  btnPrimaryHover: '#E55A2B',
  btnAccent: '#39FF14',
  btnAccentHover: '#2EDD11',
  cardBg: '#1A1A1A',
  cardBorder: '#2A2A2A',
  cardHoverBorder: 'rgba(255,107,53,0.4)',
  cardText: '#E0E0E0',
  cardPrice: '#39FF14',
  cardBrandBadge: '#FF6B35',
  footerBg: '#050505',
  footerText: '#FFFFFF',
  footerAccent: '#FF6B35',
  bodyBg: '#0D0D0D',
  filterBg: '#1A1A1A',
  filterBorder: '#2A2A2A',
  filterActive: '#FF6B35',
  filterActiveText: '#FFFFFF',
  overlayColor: 'rgba(255,107,53,0.1)',
  cartHeaderBg: '#0A0A0A',
  cartAccent: '#FF6B35',
  sectionIconBg: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
  productTagBg: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
  productTagText: '#FFFFFF',
  addBtnBg: '#FF6B35',
  addBtnHover: '#E55A2B',
};

const themes: Record<ThemeName, ThemeColors> = {
  classic: classicTheme,
  graffiti: graffitiTheme,
};

interface ThemeContextType {
  theme: ThemeColors;
  themeName: ThemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: classicTheme,
  themeName: 'classic',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'graffiti' ? 'graffiti' : 'classic') as ThemeName;
  });

  const toggleTheme = () => {
    setThemeName(prev => {
      const next = prev === 'classic' ? 'graffiti' : 'classic';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ProductVariant, VariantOption } from '../types';

interface VariantSelectorProps {
  variants: ProductVariant;
  onChange: (variants: ProductVariant) => void;
  options: VariantOption[];
}

// Detect if an option is likely a color option (by name or values)
function isColorOption(option: VariantOption): boolean {
  const colorKeywords = ['color', 'colour', '颜色', '色彩', '色'];
  const nameLower = option.name.toLowerCase();
  const nameEnLower = (option.nameEn || '').toLowerCase();
  return colorKeywords.some(k => nameLower.includes(k) || nameEnLower.includes(k));
}

const VariantSelector: React.FC<VariantSelectorProps> = ({ variants, onChange, options }) => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const updateVariant = (key: string, value: string) => {
    onChange({ ...variants, [key]: value });
  };

  // Select button style helper
  const btnStyle = (isSelected: boolean) => ({
    backgroundColor: isSelected ? theme.filterActive : (theme.name === 'graffiti' ? '#1A1A1A' : '#FFFFFF'),
    color: isSelected ? theme.filterActiveText : (theme.name === 'graffiti' ? '#AAA' : '#495057'),
    border: `1px solid ${isSelected ? theme.filterActive : (theme.name === 'graffiti' ? '#2A2A2A' : '#DEE2E6')}`,
  });

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-5">
      {options.map((option) => {
        const key = option.name;
        const selectedValue = variants[key] || '';
        const label = language === 'en' ? (option.nameEn || option.name) : option.name;
        const isColor = isColorOption(option);

        return (
          <div key={key}>
            {/* Label */}
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: theme.cardText }}>
                {label} <span className="text-red-400">*</span>
              </label>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  color: theme.name === 'graffiti' ? '#AAA' : '#6C757D',
                  backgroundColor: theme.name === 'graffiti' ? '#2A2A2A' : '#E8ECEF',
                  display: (selectedValue && isColor) ? 'inline' : 'none',
                }}
              >
                {selectedValue}
              </span>
            </div>

            {/* Color options: text labels */}
            {isColor ? (
              <div className="flex flex-wrap gap-2">
                {option.values.map((color) => {
                  const selected = selectedValue === color;
                  return (
                    <button
                      key={color}
                      onClick={() => updateVariant(key, color)}
                      title={color}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: selected
                          ? theme.filterActive
                          : (theme.name === 'graffiti' ? '#1A1A1A' : '#FFFFFF'),
                        color: selected
                          ? theme.filterActiveText
                          : (theme.name === 'graffiti' ? '#AAA' : '#495057'),
                        border: `1.5px solid ${selected ? theme.filterActive : (theme.name === 'graffiti' ? '#2A2A2A' : '#DEE2E6')}`,
                      }}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            ) : option.values.length <= 5 ? (
              /* Few options: pill buttons */
              <div className="flex flex-wrap gap-2">
                {option.values.map((val) => (
                  <button
                    key={val}
                    onClick={() => updateVariant(key, val)}
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                    style={btnStyle(selectedValue === val)}
                  >
                    {val}
                  </button>
                ))}
              </div>
            ) : (
              /* Many options: dropdown */
              <select
                value={selectedValue}
                onChange={(e) => updateVariant(key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all"
                style={{
                  border: `1px solid ${theme.filterBorder}`,
                  backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#FFFFFF',
                  color: theme.name === 'graffiti' ? '#E0E0E0' : '#495057',
                }}
              >
                <option value="">{language === 'en' ? `Select ${label}` : `选择${label}`}</option>
                {option.values.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
          {language === 'en' ? 'Additional Notes' : '备注'}
          <span className="ml-1 font-normal" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>({language === 'en' ? 'optional' : '选填'})</span>
        </label>
        <textarea
          value={variants.notes || ''}
          onChange={(e) => updateVariant('notes', e.target.value)}
          placeholder={language === 'en' ? 'Any special requirements...' : '特殊要求或备注...'}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all resize-none"
          style={{
            border: `1px solid ${theme.filterBorder}`,
            backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#FFFFFF',
            color: theme.name === 'graffiti' ? '#E0E0E0' : '#495057',
          }}
        />
      </div>
    </div>
  );
};

export default VariantSelector;

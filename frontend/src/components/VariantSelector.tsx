import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ProductVariant } from '../types';

interface VariantSelectorProps {
  variants: ProductVariant;
  onChange: (variants: ProductVariant) => void;
  product: {
    colors?: string[];
    sizes?: string[];
    specifications?: string[];
    materials?: string[];
    custom1_name?: string;
    custom1_values?: string[];
    custom2_name?: string;
    custom2_values?: string[];
    custom3_name?: string;
    custom3_values?: string[];
  };
}

const colorMap: Record<string, string> = {
  'Black': '#1A1A1A',
  'White': '#FFFFFF',
  'Red': '#E03131',
  'Blue': '#1971C2',
  'Green': '#2F9E44',
  'Yellow': '#F59F00',
  'Orange': '#E8590C',
  'Purple': '#7048E8',
  'Pink': '#E64980',
  'Brown': '#8B4513',
  'Gray': '#868E96',
  'Silver': '#CED4DA',
  'Gold': '#D4A574',
  'Navy': '#1864AB',
  'Teal': '#0B7285',
  'Cream': '#FFF9DB',
  'Beige': '#F5F5DC',
  'Rose': '#C2255C',
  'Maroon': '#9C1414',
  'Olive': '#6C6B14',
  'Dark Brown': '#5C3317',
  'Walnut': '#7B3F00',
  'Cherry': '#9B1B30',
  'Mahogany': '#C04000',
  'Briar': '#8B6914',
  'Crystal': '#E0F4FF',
  'Acrylic': '#E8F5E9',
  'Carbon Fiber': '#2C2C2C',
  'Metal': '#8D9DB6',
  'Ceramic': '#F5F0E8',
  'Wood': '#DEB887',
  'Glass': '#B2EBF2',
  'Silicone': '#FF8FAB',
  'Rainbow': 'linear-gradient(135deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff)',
};

const VariantSelector: React.FC<VariantSelectorProps> = ({ variants, onChange, product }) => {
  const { t, language } = useLanguage();

  const updateVariant = (key: keyof ProductVariant, value: any) => {
    onChange({ ...variants, [key]: value });
  };

  const isLightColor = (color: string) =>
    ['White', 'Cream', 'Beige', 'Yellow', 'Silver', 'Crystal', 'Acrylic', 'Ceramic', 'Glass'].includes(color);

  return (
    <div className="space-y-5">
      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-[#212529]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t.product.color} <span className="text-red-400">*</span>
            </label>
            {variants.color && (
              <span className="text-xs text-[#6C757D] bg-[#E8ECEF] px-2.5 py-1 rounded-full font-medium">
                {variants.color}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((color) => {
              const bg = colorMap[color] || color;
              const isGradient = bg.includes('gradient');
              const selected = variants.color === color;
              return (
                <button
                  key={color}
                  onClick={() => updateVariant('color', color)}
                  title={color}
                  className={`relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${
                    selected ? 'scale-110 ring-2 ring-offset-2 ring-[#1B4332]' : 'hover:ring-1 hover:ring-[#ADB5BD]'
                  }`}
                  style={{
                    background: isGradient ? bg : undefined,
                    backgroundColor: isGradient ? undefined : bg,
                    border: isLightColor(color) ? '1.5px solid #DEE2E6' : '1.5px solid transparent',
                  }}
                >
                  {selected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                      style={{ color: isLightColor(color) ? '#495057' : 'white' }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t.product.size} <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => updateVariant('size', size)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border ${
                  variants.size === size
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                    : 'bg-white text-[#495057] border-[#DEE2E6] hover:border-[#1B4332] hover:text-[#1B4332]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Specification Selector */}
      {product.specifications && product.specifications.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t.product.specification} <span className="text-red-400">*</span>
          </label>
          <select
            value={variants.specification}
            onChange={(e) => updateVariant('specification', e.target.value)}
            className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent bg-white text-[#495057] text-sm transition-all"
          >
            <option value="">
              {language === 'en' ? `Select ${t.product.specification}` : `选择${t.product.specification}`}
            </option>
            {product.specifications.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      )}

      {/* Material Selector */}
      {product.materials && product.materials.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t.product.material} <span className="text-red-400">*</span>
          </label>
          <select
            value={variants.material}
            onChange={(e) => updateVariant('material', e.target.value)}
            className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent bg-white text-[#495057] text-sm transition-all"
          >
            <option value="">
              {language === 'en' ? `Select ${t.product.material}` : `选择${t.product.material}`}
            </option>
            {product.materials.map((mat) => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Parameters */}
      {[
        { name: product.custom1_name, values: product.custom1_values, key: 'custom1' as const, variantObj: variants.custom1 },
        { name: product.custom2_name, values: product.custom2_values, key: 'custom2' as const, variantObj: variants.custom2 },
        { name: product.custom3_name, values: product.custom3_values, key: 'custom3' as const, variantObj: variants.custom3 },
      ]
        .filter((c) => c.name)
        .map(({ name, values, key, variantObj }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-[#212529] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {name}
            </label>
            {values && values.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {values.map((val) => (
                  <button
                    key={val}
                    onClick={() => updateVariant(key, { name: name!, value: val })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      variantObj?.value === val
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                        : 'bg-white text-[#495057] border-[#DEE2E6] hover:border-[#1B4332] hover:text-[#1B4332]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={variantObj?.value || ''}
                onChange={(e) => updateVariant(key, { name: name!, value: e.target.value })}
                placeholder={language === 'en' ? `Enter ${name}` : `请输入${name}`}
                className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-sm text-[#495057] bg-white transition-all"
              />
            )}
          </div>
        ))}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#6C757D] mb-2">
          {language === 'en' ? 'Additional Notes' : '备注'}
          <span className="ml-1 text-[#ADB5BD] font-normal">({language === 'en' ? 'optional' : '选填'})</span>
        </label>
        <textarea
          value={variants.notes || ''}
          onChange={(e) => updateVariant('notes', e.target.value)}
          placeholder={language === 'en' ? 'Any special requirements...' : '特殊要求或备注...'}
          rows={3}
          className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-sm text-[#495057] bg-white transition-all resize-none"
        />
      </div>
    </div>
  );
};

export default VariantSelector;

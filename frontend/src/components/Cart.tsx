import React, { useState, useEffect } from 'react';
import { X, Trash2, Minus, Plus, FileText, ShoppingBag, Edit2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { generateOrderPDF } from '../utils/generatePDF';
import { fetchSettings } from '../services/api';
import CustomerForm from './CustomerForm';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, getTotal, clearCart, customerInfo } = useCart();
  const { theme } = useTheme();
  const [formValid, setFormValid] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState<string>('');
  const [pendingTotal, setPendingTotal] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    fetchSettings().then(data => {
      setCompanyName(language === 'en' ? data.company_name : data.company_name_zh);
    }).catch(console.error);
  }, [language]);

  const total = getTotal();

  const finalTotal = customTotal !== '' ? parseFloat(customTotal) : total;

  const handleConfirmOrder = async () => {
    if (!formValid || items.length === 0) return;

    try {
      await generateOrderPDF({
        items,
        customer: customerInfo,
        total: finalTotal,
        originalTotal: customTotal !== '' ? total : undefined,
        language,
        companyName,
      });

      setTimeout(() => {
        clearCart();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatVariants = (item: typeof items[0]) => {
    try {
      const parts: string[] = [];
      const v = item.variants || {};
      Object.keys(v).forEach(key => {
        if (key !== 'notes' && v[key]) {
          parts.push(v[key]);
        }
      });
      return parts.join(' · ');
    } catch {
      return '';
    }
  };

  // Don't render anything at all when closed - use a single wrapper div
  if (!isOpen) {
    return null;
  }

  return (
    <div>
      {/* Backdrop - always rendered when open */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[420px] z-50 transform transition-transform duration-300 ease-out flex flex-col translate-x-0"
        style={{
          backgroundColor: theme.cardBg,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: theme.cartHeaderBg }}>
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t.cart.title}
            </h2>
            <span
              className="text-white text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{
                backgroundColor: theme.cartAccent,
                display: items.length > 0 ? 'inline' : 'none',
              }}
            >
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-8" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA' }}>
                <ShoppingBag className="w-10 h-10" style={{ color: theme.name === 'graffiti' ? '#333' : '#DEE2E6' }} />
              </div>
              <p className="text-lg font-semibold mb-2" style={{ color: theme.cardText }}>{t.cart.empty}</p>
              <p className="text-sm mb-8 text-center" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                {language === 'en' ? 'Browse our products and add items to your cart' : '浏览产品并将商品加入购物车'}
              </p>
              <button onClick={onClose} className="px-7 py-3.5 rounded-lg font-semibold transition-all duration-200 text-white" style={{ backgroundColor: theme.btnAccent, fontFamily: 'Poppins, sans-serif' }}>
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {/* Cart Items */}
              {items.filter(item => item && item.product).map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl transition-colors"
                  style={{
                    backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA',
                    border: `1px solid ${theme.filterBorder}`,
                  }}
                >
                  {/* Image */}
                  <div className="w-[52px] h-[52px] rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.name === 'graffiti' ? '#0D0D0D' : '#FFFFFF', border: `1px solid ${theme.filterBorder}` }}>
                    <img
                      src={item.product.image}
                      alt={language === 'en' ? item.product.nameEn : item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/52x52/1B4332/FFFFFF?text=No';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate mb-0.5 text-sm leading-tight" style={{ color: theme.cardText }}>
                      {language === 'en' ? item.product.nameEn : item.product.name}
                    </h4>
                    <p
                      className="text-[11px] mb-1.5 leading-relaxed"
                      style={{
                        color: theme.name === 'graffiti' ? '#888' : '#6C757D',
                        display: formatVariants(item) ? 'block' : 'none',
                      }}
                    >
                      {formatVariants(item)}
                    </p>
                    <p className="font-bold text-sm" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.cartAccent }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Box Info */}
                    <p
                      className="text-[11px] mt-0.5 font-medium"
                      style={{ color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332' }}
                    >
                      {item.boxes} ctn × {item.boxQty} pcs = {item.quantity} {language === 'en' ? 'units' : '件'}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.filterBorder}`, backgroundColor: theme.name === 'graffiti' ? '#0D0D0D' : '#FFFFFF' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.boxes - 1)}
                          className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-40"
                          style={{ color: theme.cardText }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold" style={{ color: theme.cardText }}>{item.boxes} <span className="text-[10px]" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>ctn</span></span>
                        <button
                          onClick={() => updateQuantity(item.id, item.boxes + 1)}
                          className="w-7 h-7 flex items-center justify-center transition-colors"
                          style={{ color: theme.cardText }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1.5 hover:text-red-500 rounded-lg transition-colors"
                        style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Customer Form */}
              <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${theme.filterBorder}` }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 text-white rounded-full text-xs flex items-center justify-center font-bold" style={{ backgroundColor: theme.cartHeaderBg }}>i</div>
                  <h3 className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: theme.cardText }}>
                    {language === 'en' ? 'Customer Information' : '客户信息'}
                  </h3>
                </div>
                <CustomerForm onValidChange={setFormValid} />
              </div>
            </div>
          )}
        </div>

        {/* Footer - always in DOM, visibility controlled by CSS */}
        <div
          className="px-5 py-4"
          style={{
            borderTop: `1px solid ${theme.filterBorder}`,
            backgroundColor: theme.cardBg,
            display: items.length > 0 ? 'block' : 'none',
          }}
        >
          {/* Confirm Button - above total */}
          <button
            onClick={handleConfirmOrder}
            disabled={!formValid}
            className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 mb-4"
            style={{
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: formValid ? theme.addBtnBg : (theme.name === 'graffiti' ? '#2A2A2A' : '#E8ECEF'),
              color: formValid ? '#FFFFFF' : (theme.name === 'graffiti' ? '#555' : '#ADB5BD'),
              cursor: formValid ? 'pointer' : 'not-allowed',
            }}
          >
            <FileText className="w-5 h-5" />
            {t.cart.confirmOrder}
          </button>
          <p
            className="text-xs text-center mb-3"
            style={{
              color: theme.name === 'graffiti' ? '#555' : '#ADB5BD',
              display: !formValid ? 'block' : 'none',
            }}
          >
            {language === 'en' ? 'Please fill in customer information to proceed' : '请填写客户信息后继续'}
          </p>

          {/* Subtotal */}
          <div className="pt-3" style={{ borderTop: `1px solid ${theme.filterBorder}` }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs mb-0.5" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>{language === 'en' ? 'Order Total' : '订单总计'}</p>
                <span className="text-sm" style={{ color: theme.name === 'graffiti' ? '#AAA' : '#495057' }}>{items.reduce((s, i) => s + i.quantity, 0)} {language === 'en' ? 'units' : '件'} ({items.reduce((s, i) => s + i.boxes, 0)} {language === 'en' ? 'cartons' : '箱'})</span>
              </div>

              {/* Total amount + edit */}
              <div className="flex items-center gap-2">
                {editingTotal ? (
                  /* ── Edit mode ── */
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pendingTotal}
                      onChange={(e) => setPendingTotal(e.target.value)}
                      autoFocus
                      className="w-24 text-right text-lg font-bold rounded-lg px-2 py-1 outline-none"
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F0F4F0',
                        color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332',
                        border: `1.5px solid ${theme.name === 'graffiti' ? '#FF6B35' : '#1B4332'}`,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { setCustomTotal(pendingTotal); setEditingTotal(false); }
                        else if (e.key === 'Escape') { setPendingTotal(customTotal); setEditingTotal(false); }
                      }}
                    />
                    <button
                      onClick={() => { setCustomTotal(pendingTotal); setEditingTotal(false); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.name === 'graffiti' ? '#39FF14' : '#1B4332', color: theme.name === 'graffiti' ? '#000' : '#FFF' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setPendingTotal(customTotal); setEditingTotal(false); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full"
                      style={{ color: '#EF4444' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* ── Display mode ── */
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      {customTotal !== '' && (
                        <span className="text-xs line-through" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                          ${total.toFixed(2)}
                        </span>
                      )}
                      <span className="text-2xl font-bold" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.name === 'graffiti' ? (customTotal !== '' ? '#39FF14' : '#E0E0E0') : (customTotal !== '' ? '#1B4332' : theme.cardPrice) }}>
                        ${customTotal !== '' ? parseFloat(customTotal).toFixed(2) : total.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => { setPendingTotal(customTotal !== '' ? customTotal : total.toFixed(2)); setEditingTotal(true); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
                      style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F0F4F0', color: theme.name === 'graffiti' ? '#FF6B35' : '#1B4332', border: `1px solid ${theme.filterBorder}` }}
                      title={language === 'en' ? 'Edit total price' : '修改总价'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {customTotal !== '' && (
                      <button
                        className="text-xs opacity-50 hover:opacity-100 underline"
                        style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}
                        onClick={() => { setCustomTotal(''); setPendingTotal(''); }}
                      >
                        {language === 'en' ? 'Reset' : '还原'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

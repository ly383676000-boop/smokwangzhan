import React, { useState, useEffect } from 'react';
import { X, Trash2, Minus, Plus, FileText, ShoppingBag, Edit2, Check, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { generateOrderPDF } from '../utils/generatePDF';
import { fetchSettings } from '../services/api';
import CustomerForm from './CustomerForm';

interface CartItemWithCustomPrice {
  id: string;
  price: number;
  customPrice?: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, getTotal, clearCart, customerInfo, updateItemPrice } = useCart();
  const { theme } = useTheme();
  const [formValid, setFormValid] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  
  // 单价编辑状态
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [pendingPrice, setPendingPrice] = useState<string>('');
  
  // 运费状态
  const [editingShipping, setEditingShipping] = useState(false);
  const [shippingFee, setShippingFee] = useState<string>('');
  const [pendingShipping, setPendingShipping] = useState<string>('');

  useEffect(() => {
    fetchSettings().then(data => {
      setCompanyName(language === 'en' ? data.company_name : data.company_name_zh);
    }).catch(console.error);
  }, [language]);

  const total = getTotal();
  
  // 计算最终总价 = 商品合计 + 运费
  const shippingAmount = shippingFee !== '' ? parseFloat(shippingFee) : 0;
  const finalTotal = total + shippingAmount;

  const handleConfirmOrder = async () => {
    if (!formValid || items.length === 0) return;

    try {
      await generateOrderPDF({
        items,
        customer: customerInfo,
        total: finalTotal,
        originalTotal: total,
        shippingFee: shippingAmount,
        language,
        companyName,
      });

      setTimeout(() => {
        clearCart();
        setShippingFee('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getItemPrice = (item: typeof items[0]) => {
    return item?.customPrice ?? item?.price ?? 0;
  };

  const handleEditPrice = (item: typeof items[0]) => {
    setEditingItemId(item.id);
    setPendingPrice(getItemPrice(item).toString());
  };

  const handleSavePrice = (item: typeof items[0]) => {
    const newPrice = parseFloat(pendingPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      updateItemPrice(item.id, newPrice);
    }
    setEditingItemId(null);
  };

  const handleCancelEdit = (item: typeof items[0]) => {
    setPendingPrice(getItemPrice(item).toString());
    setEditingItemId(null);
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

  // 计算单个商品的小计
  const getItemSubtotal = (item: typeof items[0]) => {
    const price = item.customPrice !== undefined ? item.customPrice : item.price;
    return price * item.quantity;
  };

  // Don't render anything at all when closed - use a single wrapper div
  if (!isOpen) {
    return null;
  }

  return (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="w-full max-w-2xl max-h-[90vh] rounded-2xl z-50 transform flex flex-col overflow-hidden"
          style={{
            backgroundColor: theme.cardBg,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: theme.cartHeaderBg }}>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-8" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA' }}>
                  <ShoppingBag className="w-12 h-12" style={{ color: theme.name === 'graffiti' ? '#333' : '#DEE2E6' }} />
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
                  className="flex gap-5 p-5 rounded-xl transition-colors"
                  style={{
                    backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F8F9FA',
                    border: `1px solid ${theme.filterBorder}`,
                  }}
                >
                  {/* Image */}
                  <div className="w-[80px] h-[80px] rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.name === 'graffiti' ? '#0D0D0D' : '#FFFFFF', border: `1px solid ${theme.filterBorder}` }}>
                    <img
                      src={item.product.image}
                      alt={language === 'en' ? item.product.nameEn : item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80/1B4332/FFFFFF?text=No';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate mb-1 text-base leading-tight" style={{ color: theme.cardText }}>
                      {language === 'en' ? item.product.nameEn : item.product.name}
                    </h4>
                    <p
                      className="text-sm mb-2 leading-relaxed"
                      style={{
                        color: theme.name === 'graffiti' ? '#888' : '#6C757D',
                        display: formatVariants(item) ? 'block' : 'none',
                      }}
                    >
                      {formatVariants(item)}
                    </p>
                    
                    {/* Unit Price (Editable) */}
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium" style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
                        {language === 'en' ? 'Unit:' : '单价:'}
                      </span>
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1">
                            <span className="text-lg font-bold" style={{ color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332' }}>$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={pendingPrice}
                              onChange={(e) => setPendingPrice(e.target.value)}
                              autoFocus
                              className="w-24 text-xl font-bold text-center outline-none"
                              style={{
                                fontFamily: "'Roboto Mono', monospace",
                                color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332',
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePrice(item);
                                else if (e.key === 'Escape') handleCancelEdit(item);
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleSavePrice(item)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: theme.name === 'graffiti' ? '#39FF14' : '#1B4332', color: theme.name === 'graffiti' ? '#000' : '#FFF' }}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancelEdit(item)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.cartAccent }}>
                            ${getItemPrice(item).toFixed(2)}
                          </span>
                          {item.customPrice !== undefined && (
                            <span className="text-sm line-through" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>
                              ${item.price?.toFixed(2) || '0.00'}
                            </span>
                          )}
                          <button
                            onClick={() => handleEditPrice(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110"
                            style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F0F4F0', color: theme.name === 'graffiti' ? '#FF6B35' : '#1B4332' }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Subtotal */}
                    <p className="font-bold text-sm" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.cartAccent }}>
                      = ${getItemSubtotal(item).toFixed(2)}
                    </p>

                    {/* Box Info */}
                    <p
                      className="text-[11px] mt-0.5 font-medium"
                      style={{ color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332' }}
                    >
                      {item.boxes} ctn × {item.boxQty} pcs = {item.quantity} {language === 'en' ? 'units' : '件'}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.filterBorder}`, backgroundColor: theme.name === 'graffiti' ? '#0D0D0D' : '#FFFFFF' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.boxes - 1)}
                          className="w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-40"
                          style={{ color: theme.cardText }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-14 text-center text-base font-semibold" style={{ color: theme.cardText }}>{item.boxes} <span className="text-xs" style={{ color: theme.name === 'graffiti' ? '#555' : '#ADB5BD' }}>箱</span></span>
                        <button
                          onClick={() => updateQuantity(item.id, item.boxes + 1)}
                          className="w-10 h-10 flex items-center justify-center transition-colors"
                          style={{ color: theme.cardText }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-2 hover:bg-red-50 rounded-lg transition-colors"
                        style={{ color: '#EF4444' }}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
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

          {/* Footer - always in DOM */}
          <div
            className="px-5 py-4 flex-shrink-0"
            style={{
              borderTop: `1px solid ${theme.filterBorder}`,
              display: items.length > 0 ? 'block' : 'none',
            }}
          >
            {/* Confirm Button */}
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

            {/* Subtotal & Shipping */}
            <div className="pt-3 space-y-3" style={{ borderTop: `1px solid ${theme.filterBorder}` }}>
              {/* Item summary */}
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: theme.name === 'graffiti' ? '#AAA' : '#495057' }}>
                  {items.reduce((s, i) => s + i.quantity, 0)} {language === 'en' ? 'units' : '件'} ({items.reduce((s, i) => s + i.boxes, 0)} {language === 'en' ? 'cartons' : '箱'})
                </span>
                <span className="text-sm font-medium" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}>
                  {language === 'en' ? 'Subtotal:' : '商品合计:'} ${total.toFixed(2)}
                </span>
              </div>

              {/* Shipping Fee */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" style={{ color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332' }} />
                  <span className="text-sm" style={{ color: theme.name === 'graffiti' ? '#AAA' : '#495057' }}>
                    {language === 'en' ? 'Shipping Fee:' : '运费:'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editingShipping ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pendingShipping}
                        onChange={(e) => setPendingShipping(e.target.value)}
                        autoFocus
                        className="w-20 text-right text-base font-semibold rounded-lg px-2 py-1 outline-none"
                        style={{
                          fontFamily: "'Roboto Mono', monospace",
                          backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F0F4F0',
                          color: theme.name === 'graffiti' ? '#39FF14' : '#1B4332',
                          border: `1.5px solid ${theme.name === 'graffiti' ? '#FF6B35' : '#1B4332'}`,
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { setShippingFee(pendingShipping); setEditingShipping(false); }
                          else if (e.key === 'Escape') { setPendingShipping(shippingFee); setEditingShipping(false); }
                        }}
                      />
                      <button
                        onClick={() => { setShippingFee(pendingShipping); setEditingShipping(false); }}
                        className="w-6 h-6 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: theme.name === 'graffiti' ? '#39FF14' : '#1B4332', color: theme.name === 'graffiti' ? '#000' : '#FFF' }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setPendingShipping(shippingFee); setEditingShipping(false); }}
                        className="w-6 h-6 flex items-center justify-center rounded-full"
                        style={{ color: '#EF4444' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.cartAccent }}>
                        ${shippingAmount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => { setPendingShipping(shippingFee !== '' ? shippingFee : '0'); setEditingShipping(true); }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:scale-110"
                        style={{ backgroundColor: theme.name === 'graffiti' ? '#1A1A1A' : '#F0F4F0', color: theme.name === 'graffiti' ? '#FF6B35' : '#1B4332', border: `1px solid ${theme.filterBorder}` }}
                        title={language === 'en' ? 'Edit shipping fee' : '修改运费'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {shippingFee !== '' && (
                        <button
                          className="text-xs opacity-50 hover:opacity-100 underline"
                          style={{ color: theme.name === 'graffiti' ? '#888' : '#6C757D' }}
                          onClick={() => { setShippingFee(''); setPendingShipping(''); }}
                        >
                          {language === 'en' ? 'Reset' : '清除'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Final Total */}
              <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px dashed ${theme.filterBorder}` }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.name === 'graffiti' ? '#E0E0E0' : '#495057' }}>
                    {language === 'en' ? 'Order Total' : '订单总计'}
                  </p>
                </div>
                <span className="text-2xl font-bold" style={{ fontFamily: "'Roboto Mono', monospace", color: theme.name === 'graffiti' ? '#39FF14' : theme.cardPrice }}>
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

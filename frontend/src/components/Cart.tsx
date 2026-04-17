import React, { useState } from 'react';
import { X, Trash2, Minus, Plus, FileText, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { generateOrderPDF } from '../utils/generatePDF';
import CustomerForm from './CustomerForm';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, getTotal, clearCart, customerInfo } = useCart();
  const [formValid, setFormValid] = useState(false);

  const total = getTotal();

  const handleConfirmOrder = () => {
    if (!formValid || items.length === 0) return;

    generateOrderPDF({
      items,
      customer: customerInfo,
      total,
      language,
    });

    setTimeout(() => {
      clearCart();
      onClose();
    }, 1000);
  };

  const formatVariants = (item: typeof items[0]) => {
    const parts: string[] = [];
    if (item.variants.color) parts.push(item.variants.color);
    if (item.variants.size) parts.push(item.variants.size);
    if (item.variants.specification) parts.push(item.variants.specification);
    if (item.variants.material) parts.push(item.variants.material);
    if (item.variants.custom1?.value) parts.push(`${item.variants.custom1.name}: ${item.variants.custom1.value}`);
    if (item.variants.custom2?.value) parts.push(`${item.variants.custom2.name}: ${item.variants.custom2.value}`);
    if (item.variants.custom3?.value) parts.push(`${item.variants.custom3.name}: ${item.variants.custom3.value}`);
    return parts.join(' · ');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1B4332]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t.cart.title}
            </h2>
            {items.length > 0 && (
              <span className="bg-[#D4A574] text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {items.length}
              </span>
            )}
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
            <div className="flex flex-col items-center justify-center h-full text-[#6C757D] px-8">
              <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="w-10 h-10 text-[#DEE2E6]" />
              </div>
              <p className="text-lg font-semibold text-[#212529] mb-2">{t.cart.empty}</p>
              <p className="text-sm text-[#ADB5BD] mb-8 text-center">
                {language === 'en' ? 'Browse our products and add items to your cart' : '浏览产品并将商品加入购物车'}
              </p>
              <button onClick={onClose} className="btn-accent">
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {/* Cart Items */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E8ECEF] hover:border-[#1B4332]/20 transition-colors"
                >
                  {/* Image */}
                  <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-white flex-shrink-0 border border-[#E8ECEF]">
                    <img
                      src={item.product.image}
                      alt={language === 'en' ? item.product.nameEn : item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/72x72/1B4332/FFFFFF?text=No';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#212529] truncate mb-0.5 text-sm leading-tight">
                      {language === 'en' ? item.product.nameEn : item.product.name}
                    </h4>
                    {formatVariants(item) && (
                      <p className="text-[11px] text-[#6C757D] mb-1.5 leading-relaxed">
                        {formatVariants(item)}
                      </p>
                    )}
                    <p className="text-[#D4A574] font-bold text-sm" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center border border-[#DEE2E6] rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-[#F8F9FA] transition-colors disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 text-[#495057]" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-[#212529]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
                        >
                          <Plus className="w-3 h-3 text-[#495057]" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1.5 text-[#ADB5BD] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Customer Form */}
              <div className="mt-5 pt-5 border-t border-[#E8ECEF]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#1B4332] text-white rounded-full text-xs flex items-center justify-center font-bold">i</div>
                  <h3 className="font-semibold text-[#212529] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {language === 'en' ? 'Customer Information' : '客户信息'}
                  </h3>
                </div>
                <CustomerForm onValidChange={setFormValid} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#E8ECEF] bg-white">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#E8ECEF]">
              <div>
                <p className="text-xs text-[#6C757D] mb-0.5">{language === 'en' ? 'Order Total' : '订单总计'}</p>
                <span className="text-sm text-[#495057]">{items.reduce((s, i) => s + i.quantity, 0)} {language === 'en' ? 'items' : '件商品'}</span>
              </div>
              <span className="text-2xl font-bold text-[#1B4332]" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmOrder}
              disabled={!formValid}
              className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
                formValid
                  ? 'bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-[#E8ECEF] text-[#ADB5BD] cursor-not-allowed'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <FileText className="w-5 h-5" />
              {t.cart.confirmOrder}
            </button>
            {!formValid && (
              <p className="text-xs text-[#ADB5BD] text-center mt-2">
                {language === 'en' ? 'Please fill in customer information to proceed' : '请填写客户信息后继续'}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;

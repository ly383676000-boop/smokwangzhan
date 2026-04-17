import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface CustomerFormProps {
  onValidChange: (valid: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onValidChange }) => {
  const { t, language } = useLanguage();
  const { setCustomerInfo } = useCart();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone validation - allows various formats
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;

  const validateForm = (data: FormData): boolean => {
    const newErrors: Partial<FormData> = {};

    // Name is required
    if (!data.name.trim()) {
      newErrors.name = language === 'en' ? 'Name is required' : '请输入姓名';
    }

    // Email is required and must be valid
    if (!data.email.trim()) {
      newErrors.email = language === 'en' ? 'Email is required' : '请输入邮箱';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = language === 'en' ? 'Invalid email format' : '邮箱格式不正确';
    }

    // Phone is required and must be valid
    if (!data.phone.trim()) {
      newErrors.phone = language === 'en' ? 'Phone is required' : '请输入电话';
    } else if (!phoneRegex.test(data.phone)) {
      newErrors.phone = language === 'en' ? 'Invalid phone format' : '电话格式不正确';
    }

    // Address is required
    if (!data.address.trim()) {
      newErrors.address = language === 'en' ? 'Address is required' : '请输入地址';
    }

    // City is required
    if (!data.city.trim()) {
      newErrors.city = language === 'en' ? 'City is required' : '请输入城市';
    }

    // Country is required
    if (!data.country.trim()) {
      newErrors.country = language === 'en' ? 'Country is required' : '请输入国家';
    }

    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    onValidChange(isValid);
    
    return isValid;
  };

  useEffect(() => {
    // Update cart context when form data changes
    if (validateForm(formData)) {
      setCustomerInfo(formData);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Full Name' : '姓名'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={language === 'en' ? 'Enter your full name' : '请输入您的姓名'}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-colors ${
            errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1B4332]'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Email' : '邮箱'} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={language === 'en' ? 'Enter your email' : '请输入您的邮箱'}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-colors ${
            errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1B4332]'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Phone Number' : '电话'} <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder={language === 'en' ? 'Enter your phone number' : '请输入您的电话'}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-colors ${
            errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1B4332]'
          }`}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Country' : '国家'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder={language === 'en' ? 'Enter your country' : '请输入您的国家'}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-colors ${
            errors.country ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1B4332]'
          }`}
        />
        {errors.country && (
          <p className="mt-1 text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* City & State Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            {language === 'en' ? 'City' : '城市'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder={language === 'en' ? 'City' : '城市'}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-colors ${
              errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1B4332]'
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            {language === 'en' ? 'State/Province' : '州/省'}
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder={language === 'en' ? 'State' : '州/省'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Street Address' : '详细地址'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder={language === 'en' ? 'Enter your street address' : '请输入您的详细地址'}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-colors ${
            errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1B4332]'
          }`}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-500">{errors.address}</p>
        )}
      </div>

      {/* Zip Code */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Zip/Postal Code' : '邮编'}
        </label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder={language === 'en' ? 'Enter zip code' : '请输入邮编'}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          {language === 'en' ? 'Order Notes' : '订单备注'}
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder={language === 'en' ? 'Special instructions or notes...' : '特殊说明或备注...'}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-colors resize-none"
        />
      </div>
    </div>
  );
};

export default CustomerForm;

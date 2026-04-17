import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99 
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <Minus className="w-5 h-5 text-[#333333]" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="w-16 h-12 text-center text-lg font-semibold text-[#1A1A1A] border-x border-gray-200 focus:outline-none focus:bg-gray-50"
      />
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <Plus className="w-5 h-5 text-[#333333]" />
      </button>
    </div>
  );
};

export default QuantitySelector;

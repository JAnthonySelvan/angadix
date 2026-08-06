import React, { useState } from 'react';
import { Truck, HelpCircle, MapPin, ChevronDown } from 'lucide-react';

export const TopAlertBanner = () => {
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('English');

  return (
    <div className="bg-primary-900 text-white text-xs py-2 px-4 border-b border-primary-800/60 hidden sm:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Shipping Notice */}
        <div className="flex items-center gap-2 font-medium">
          <Truck size={14} className="text-primary-300 animate-pulse" />
          <span>
            ⚡ <strong className="font-bold text-white">Free Express Shipping</strong> on all orders over ₹999 | Use Code: <strong className="text-amber-300">ANGADIX10</strong>
          </span>
        </div>

        {/* Right: Help & Selectors */}
        <div className="flex items-center gap-6 font-medium text-slate-200">
          <a href="#tracking" className="flex items-center gap-1 hover:text-white transition-colors">
            <MapPin size={13} />
            <span>State Tracking</span>
          </a>
          <a href="#help" className="flex items-center gap-1 hover:text-white transition-colors">
            <HelpCircle size={13} />
            <span>Help & Support</span>
          </a>

          {/* Currency Dropdown */}
          <div className="relative flex items-center gap-1 cursor-pointer hover:text-white">
            <span>{currency}</span>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

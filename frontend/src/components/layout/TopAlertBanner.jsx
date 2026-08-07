import React, { useState } from 'react';
import { Truck, HelpCircle, MapPin, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TopAlertBanner = () => {
  const { t } = useTranslation();
  const [currency] = useState('INR (₹)');

  return (
    <div className="bg-primary-900 text-white text-xs py-2 px-4 border-b border-primary-800/60 hidden sm:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Shipping Notice */}
        <div className="flex items-center gap-2 font-medium">
          <Truck size={14} className="text-primary-300 animate-pulse" />
          <span>
            {t('nav.topBannerText', '⚡ Free Express Shipping on all orders over ₹999')}
          </span>
        </div>

        {/* Right: Help & Selectors */}
        <div className="flex items-center gap-6 font-medium text-slate-200">
          <a href="#tracking" className="flex items-center gap-1 hover:text-white transition-colors">
            <MapPin size={13} />
            <span>{t('footer.trackOrder', 'Track Order')}</span>
          </a>
          <a href="#help" className="flex items-center gap-1 hover:text-white transition-colors">
            <HelpCircle size={13} />
            <span>{t('footer.helpCenter', 'Help & Support')}</span>
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

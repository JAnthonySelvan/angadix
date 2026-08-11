import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, ArrowRight, Grid, Tag, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';

export const MegaMenu = ({ variant = 'compact', isOverHero = false }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const categories = useAppSelector((state) => state.products.categories.items) || [];
  const brands = useAppSelector((state) => state.products.brands.items) || [];
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Category Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-2 px-3 font-extrabold text-xs transition-colors focus:outline-none ${
          variant === 'nav'
            ? isOverHero
              ? 'h-10 -mx-3 rounded-lg text-[#0a2540] dark:text-white hover:text-[#0266C8] dark:hover:text-white/80 hover:bg-[#0266C8]/10 dark:hover:bg-white/10'
              : 'h-10 -mx-3 rounded-lg text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-800'
            : 'rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
        }`}
      >
        <Grid size={15} className={variant === 'nav' && isOverHero ? 'text-[#0266C8] dark:text-white' : 'text-primary-600 dark:text-primary-400'} />
        <span>{t('nav.categories', 'Categories')}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Mega Menu Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 rtl:left-auto rtl:right-0 mt-3 w-80 sm:w-[640px] md:w-[768px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Categories Grid */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Grid size={14} />
                    <span>{t('nav.exploreCategories', 'Explore Categories')}</span>
                  </span>
                  <Link
                  to="/categories"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <span>{t('common.viewAll', 'View All')}</span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <div className="col-span-2 text-xs text-slate-400 p-4 text-center">
                      Loading categories...
                    </div>
                  ) : (
                    categories.map((cat) => {
                      const catImageUrl = typeof cat.image === 'string'
                        ? cat.image
                        : (cat.image?.url || (typeof cat.icon === 'string' ? cat.icon : cat.icon?.url));
                      return (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-slate-800 dark:text-slate-200 hover:text-primary-600 transition-all group"
                        >
                          {catImageUrl ? (
                            <img
                              src={catImageUrl}
                              alt={cat.name}
                              className="w-8 h-8 object-cover rounded-xl shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 shrink-0 ${catImageUrl ? 'hidden' : ''}`}>
                            <Tag size={16} />
                          </div>
                          <span className="text-xs font-bold truncate group-hover:translate-x-0.5 transition-transform">
                            {cat.name}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Featured Brands & Promo Highlight */}
              <div className="md:col-span-5 space-y-4 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-6 rtl:md:border-l-0 rtl:md:border-r rtl:md:pl-0 rtl:md:pr-6">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>{t('home.brandsTitle', 'Featured Brands')}</span>
                  </span>
                </div>

                {/* Brand Logos Pills */}
                <div className="flex flex-wrap gap-2">
                  {brands.slice(0, 6).map((brand) => {
                    const brandLogoUrl = typeof brand.logo === 'string'
                      ? brand.logo
                      : (brand.logo?.url || (typeof brand.image === 'string' ? brand.image : brand.image?.url));
                    return (
                      <Link
                        key={brand._id}
                        to={`/shop?brand=${brand.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {brandLogoUrl ? (
                          <img src={brandLogoUrl} alt={brand.name} className="w-4 h-4 object-contain rounded shrink-0" />
                        ) : null}
                        <span>{brand.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Highlight Promo Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-600 to-sky-700 text-white space-y-2 shadow-lg shadow-primary-600/20">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-200 uppercase tracking-wider">
                    <Flame size={14} className="text-amber-300" />
                    <span>{t('home.flashSaleTitle', 'Flash Sale')}</span>
                  </div>
                  <h4 className="text-sm font-black leading-tight">
                    {t('home.heroTitle1', 'Up to 50% Off Top Tech & Wearables')}
                  </h4>
                  <Link
                    to="/flash-sale"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <span>{t('common.shopNow', 'Shop Now')}</span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, RefreshCcw, X } from 'lucide-react';

export const MobileFilterDrawer = ({
  isOpen,
  onClose,
  t,
  activeFilterCount = 0,
  handleResetFilters,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Drawer slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-xs sm:max-w-sm h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-[#BAE6FD]/80 dark:border-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#BAE6FD]/60 dark:border-slate-800">
                <div className="flex items-center gap-2.5 font-extrabold font-heading text-base text-[#0a2540] dark:text-white">
                  <SlidersHorizontal size={20} className="text-[#0266C8] dark:text-sky-400" />
                  <span>{t('shop.filterTitle', 'Filter Products')}</span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#0266C8] text-white rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-slate-400 hover:text-[#0266C8] dark:hover:text-sky-400 flex items-center gap-1 transition-colors p-1"
                    title={t('shop.clearFilters', 'Reset')}
                  >
                    <RefreshCcw size={14} />
                    <span>{t('shop.clearFilters', 'Reset')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="space-y-6">{children}</div>
            </div>

            {/* Bottom Apply Button */}
            <div className="pt-4 border-t border-[#BAE6FD]/60 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-[#0266C8] hover:bg-[#0054A6] rounded-xl shadow-md transition-all text-center"
              >
                {t('common.apply', 'Apply Filters')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

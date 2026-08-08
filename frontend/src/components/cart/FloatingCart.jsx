import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  selectCartTotalCount,
  selectCartFinalTotal,
  selectIsCartDrawerOpen,
  toggleCartDrawer,
} from '../../features/cart/cartSlice';

export const FloatingCart = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const totalCount = useAppSelector(selectCartTotalCount);
  const finalTotal = useAppSelector(selectCartFinalTotal);
  const isDrawerOpen = useAppSelector(selectIsCartDrawerOpen);

  // Hide widget on cart and checkout pages or when drawer is open
  const isHiddenRoute =
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/admin');

  if (isHiddenRoute || isDrawerOpen || totalCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        onClick={() => dispatch(toggleCartDrawer())}
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 flex items-center gap-3 p-3.5 sm:px-5 sm:py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-primary-600/30 hover:scale-105 active:scale-95 transition-all group"
        aria-label={t('cart.title', 'Shopping Cart')}
      >
        <div className="relative">
          <ShoppingBag size={22} className="text-primary-400 dark:text-primary-600" />
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow">
            {totalCount}
          </span>
        </div>

        <div className="hidden sm:flex flex-col text-left rtl:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            {t('cart.orderSummary', 'Cart Total')}
          </span>
          <span className="text-xs font-black">
            ₹{finalTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
      </motion.button>
    </AnimatePresence>
  );
};

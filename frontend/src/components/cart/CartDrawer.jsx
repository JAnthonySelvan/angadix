import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearCartRemote } from '../../features/cart/cartThunks';
import {
  setCartDrawerOpen,
  selectCartItems,
  selectCartTotalPrice,
  selectCartDiscountAmount,
  selectCartFinalTotal,
  selectCartTotalCount,
} from '../../features/cart/cartSlice';
import { CartItemRow } from './CartItemRow';
import { CouponSection } from './CouponSection';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isOpen = useAppSelector((state) => state.cart.isCartOpen);
  const items = useAppSelector(selectCartItems);
  const totalCount = useAppSelector(selectCartTotalCount);
  const subtotal = useAppSelector(selectCartTotalPrice);
  const discountAmount = useAppSelector(selectCartDiscountAmount);
  const finalTotal = useAppSelector(selectCartFinalTotal);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleClearCart = () => {
    dispatch(clearCartRemote());
    setIsConfirmOpen(false);
    toast.success('Cart cleared.');
  };

  const handleClose = () => {
    dispatch(setCartDrawerOpen(false));
  };

  const handleNavigateToCartPage = () => {
    handleClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 className="font-black text-base text-slate-900 dark:text-white">
                    Your Shopping Cart
                  </h2>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShoppingBag size={36} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                      Your cart is empty
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Explore our premium product collection and add your favorite items.
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    onClick={handleClose}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <CartItemRow key={item.product._id} item={item} isCompact={true} />
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
                {/* Coupon Section */}
                <CouponSection isCompact={true} />

                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs font-semibold pt-1">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span className="font-bold">
                        -₹{discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Express Shipping</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                      FREE
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Amount</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsConfirmOpen(true)}
                      className="py-2.5 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      Clear
                    </button>

                    <ConfirmDialog
                      isOpen={isConfirmOpen}
                      onClose={() => setIsConfirmOpen(false)}
                      onConfirm={handleClearCart}
                      title="Clear Shopping Cart"
                      message="Are you sure you want to clear all items from your shopping cart? This action cannot be undone."
                      confirmText="Clear Cart"
                    />

                    <button
                      onClick={handleNavigateToCartPage}
                      className="flex-1 py-2.5 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Full Cart Review</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleClose();
                      navigate('/checkout');
                    }}
                    className="w-full py-3 px-5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

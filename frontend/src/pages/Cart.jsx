import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCartRemote } from '../features/cart/cartThunks';
import {
  selectCartItems,
  selectCartTotalPrice,
  selectCartDiscountAmount,
  selectCartFinalTotal,
  selectCartTotalCount,
} from '../features/cart/cartSlice';
import { CartItemRow } from '../components/cart/CartItemRow';
import { CouponSection } from '../components/cart/CouponSection';
import { SavedForLaterSection } from '../components/cart/SavedForLaterSection';
import { FrequentlyBoughtTogether } from '../components/common/FrequentlyBoughtTogether';
import { RecentlyViewed } from '../components/common/RecentlyViewed';
import toast from 'react-hot-toast';

export const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector(selectCartItems);
  const totalCount = useAppSelector(selectCartTotalCount);
  const subtotal = useAppSelector(selectCartTotalPrice);
  const discountAmount = useAppSelector(selectCartDiscountAmount);
  const finalTotal = useAppSelector(selectCartFinalTotal);

  const handleClearCart = () => {
    dispatch(clearCartRemote());
    toast.success('Cart cleared.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>

        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Shopping Cart Review
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review your items, apply promotional discounts, and proceed to checkout
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-extrabold text-xs self-start sm:self-center">
          <Sparkles size={14} />
          <span>{totalCount} {totalCount === 1 ? 'Item' : 'Items'} Selected</span>
        </span>
      </div>

      {/* Main Cart Content */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="neu-card p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-5 max-w-lg mx-auto">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-50 via-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-800/60 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto shadow-inner">
            <ShoppingBag size={44} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Your Shopping Cart is Empty
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Discover our curated catalog of premium gadgets, accessories, and best-selling electronics.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary-600/30 transition-all"
          >
            <span>Explore Shop Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* 2-Column Responsive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items + Saved for Later + AI Recommendations */}
          <div className="lg:col-span-8 space-y-8">
            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.product._id} item={item} isCompact={false} />
              ))}
            </div>

            {/* Saved for Later Section */}
            <SavedForLaterSection />

            {/* AI Frequently Bought Together Section */}
            <FrequentlyBoughtTogether />

            {/* AI Recently Viewed Section */}
            <RecentlyViewed />
          </div>

          {/* Right Column: Order Summary & Coupon Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <h2 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-slate-400 font-normal">
                  {totalCount} items
                </span>
              </h2>

              {/* Coupon Section */}
              <CouponSection isCompact={false} />

              {/* Price Breakdown */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Cart Subtotal</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-extrabold">
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Express Shipping</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                    FREE
                  </span>
                </div>

                {/* Free Delivery Banner */}
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <Truck size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Congrats! You qualify for FREE Express Shipping!</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      Total Amount
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Inclusive of all taxes
                    </span>
                  </div>
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  navigate('/checkout');
                }}
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              {/* Security Badges */}
              <div className="pt-2 grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-400 text-center">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Lock size={14} className="text-primary-500" />
                  <span>256-Bit SSL</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <RotateCcw size={14} className="text-indigo-500" />
                  <span>Easy Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Tag, CheckCircle2, XCircle, Trash2, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { applyCoupon, removeCoupon } from '../../features/cart/cartThunks';
import {
  selectAppliedCoupon,
  selectCartTotalPrice,
  selectCartDiscountAmount,
} from '../../features/cart/cartSlice';
import toast from 'react-hot-toast';

export const CouponSection = ({ isCompact = false }) => {
  const dispatch = useAppDispatch();
  const [couponInput, setCouponInput] = useState('');

  const subtotal = useAppSelector(selectCartTotalPrice);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const discountAmount = useAppSelector(selectCartDiscountAmount);
  const { isCouponApplying, couponError } = useAppSelector((state) => state.cart);

  const PRESET_COUPONS = [
    { code: 'WELCOME10', label: '10% OFF', minOrder: 1000 },
    { code: 'SAVE20', label: '20% OFF', minOrder: 2000 },
    { code: 'FLAT500', label: '₹500 OFF', minOrder: 3000 },
  ];

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const codeToApply = couponInput.trim().toUpperCase();

    if (!codeToApply) {
      toast.error('Please enter a valid coupon code.');
      return;
    }

    if (subtotal <= 0) {
      toast.error('Cannot apply coupon to an empty cart.');
      return;
    }

    try {
      await dispatch(applyCoupon(codeToApply)).unwrap();
      toast.success(`Coupon '${codeToApply}' applied successfully!`);
      setCouponInput('');
    } catch (err) {
      toast.error(err || 'Failed to apply coupon.');
    }
  };

  const handleApplyPreset = (code) => {
    setCouponInput(code);
    dispatch(applyCoupon(code))
      .unwrap()
      .then(() => {
        toast.success(`Coupon '${code}' applied!`);
      })
      .catch((err) => {
        toast.error(err || 'Could not apply preset coupon.');
      });
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed.');
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Tag size={14} className="text-primary-600 dark:text-primary-400" />
          <span>Promo / Coupon Code</span>
        </span>
      </div>

      {/* Applied Coupon Active State */}
      {appliedCoupon ? (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500 text-white flex-shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 tracking-wide uppercase">
                  {appliedCoupon.code}
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                  APPLIED
                </span>
              </div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">
                Saving ₹{discountAmount.toLocaleString('en-IN')} on this order!
              </p>
            </div>
          </div>

          <button
            onClick={handleRemoveCoupon}
            className="p-1.5 text-emerald-700 hover:text-rose-600 dark:text-emerald-300 dark:hover:text-rose-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="Remove coupon"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        /* Input Form */
        <form onSubmit={handleApplyCoupon} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. WELCOME10"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                if (couponError) dispatch(clearCouponError());
              }}
              className="flex-1 px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={isCouponApplying || !couponInput.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isCouponApplying ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {/* Inline Error Message */}
          {couponError && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
              <XCircle size={13} />
              <span>{couponError}</span>
            </div>
          )}

          {/* Preset Chips */}
          {!isCompact && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> Available:
              </span>
              {PRESET_COUPONS.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => handleApplyPreset(preset.code)}
                  className="px-2 py-0.5 text-[10px] font-extrabold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/80 border border-primary-200 dark:border-primary-800 rounded-full transition-colors"
                >
                  {preset.code} ({preset.label})
                </button>
              ))}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

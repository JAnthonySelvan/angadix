import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectCartItems,
  selectCartTotalPrice,
  selectCartDiscountAmount,
  selectCartFinalTotal,
  selectCartTotalCount,
  selectAppliedCoupon,
} from '../features/cart/cartSlice';
import { resetCheckout } from '../features/checkout/orderSlice';
import { AddressStep } from '../components/checkout/AddressStep';
import { DeliveryStep } from '../components/checkout/DeliveryStep';
import { PaymentStep } from '../components/checkout/PaymentStep';
import { Badge } from '../components/ui/Badge';

const STEPS = [
  { id: 'address', label: '1. Shipping Address', icon: MapPin },
  { id: 'delivery', label: '2. Delivery Method', icon: Truck },
  { id: 'payment', label: '3. Payment', icon: CreditCard },
];

export const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const cartItems = useAppSelector(selectCartItems);
  const totalCount = useAppSelector(selectCartTotalCount);
  const subtotal = useAppSelector(selectCartTotalPrice);
  const discountAmount = useAppSelector(selectCartDiscountAmount);
  const finalTotal = useAppSelector(selectCartFinalTotal);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);

  const [step, setStep] = useState('address');
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Guard against empty cart and reset stale checkout state on mount
  useEffect(() => {
    dispatch(resetCheckout());
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [dispatch, cartItems, navigate]);

  const stepOrder = ['address', 'delivery', 'payment'];
  const currentStepIndex = stepOrder.indexOf(step);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>
      </div>

      {/* Stepper Header Indicator */}
      <div className="neu-card p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-lg">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const Icon = s.icon;

            return (
              <div
                key={s.id}
                onClick={() => isCompleted && setStep(s.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-2xl transition-all ${
                  isCompleted ? 'cursor-pointer' : ''
                } ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 fill-emerald-100" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>

                <span className="text-xs font-extrabold tracking-tight text-center sm:text-left">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Step Form */}
        <div className="lg:col-span-8 neu-card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'address' && (
                <AddressStep
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={setSelectedAddressId}
                  onNext={() => setStep('delivery')}
                />
              )}

              {step === 'delivery' && (
                <DeliveryStep
                  selectedAddressId={selectedAddressId}
                  onBack={() => setStep('address')}
                  onNext={() => setStep('payment')}
                />
              )}

              {step === 'payment' && (
                <PaymentStep
                  selectedAddressId={selectedAddressId}
                  onBack={() => setStep('delivery')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Persistent Order Summary Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-400 font-normal">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            </h2>

            {/* Purchased Items List Snapshot Preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const effectivePrice =
                  product.discountPrice !== null && product.discountPrice !== undefined
                    ? product.discountPrice
                    : product.price;

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"
                  >
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : 'https://via.placeholder.com/80'
                      }
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Qty: {item.quantity} × ₹{effectivePrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      ₹{(effectivePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Applied Coupon Info if any */}
            {appliedCoupon && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>Coupon '{appliedCoupon.code}'</span>
                </div>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
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

              {/* Total */}
              <div className="flex justify-between items-baseline pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white block">
                    Total Payable
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
    </div>
  );
};

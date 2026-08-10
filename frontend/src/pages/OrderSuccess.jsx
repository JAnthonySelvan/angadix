import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ShoppingBag,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchOrderById } from '../features/checkout/orderThunks';
import { selectSelectedOrder, resetCheckout } from '../features/checkout/orderSlice';
import { clearCartState } from '../features/cart/cartSlice';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getProductImageUrl } from '../utils/orderHelpers';
import { PageTransition } from '../components/common/PageTransition';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const { data: order, loading, error } = useAppSelector(selectSelectedOrder);

  useEffect(() => {
    dispatch(clearCartState());
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    return () => {
      dispatch(resetCheckout());
    };
  }, [dispatch, orderId]);

  if (loading || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" color="primary" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          Loading your order confirmation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Unable to Load Order
        </h2>
        <p className="text-xs text-rose-500">{error}</p>
        <Link to="/shop">
          <Button variant="primary" size="md">
            Return to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Animated Success Card Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="neu-card p-8 sm:p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-5 shadow-2xl relative overflow-hidden"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 size={48} className="stroke-[2.5]" />
        </div>

        <div className="space-y-1.5 max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
            <Sparkles size={14} />
            <span>Order Confirmed & Placed!</span>
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Thank You for Your Order!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Order Reference:{' '}
            <span className="font-extrabold text-slate-900 dark:text-white uppercase">
              {order.orderNumber}
            </span>
          </p>
        </div>

        {/* Delivery Estimate Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 max-w-md mx-auto flex items-center justify-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Calendar size={18} className="text-primary-600 dark:text-primary-400" />
          <span>Estimated Express Delivery by {formattedDelivery}</span>
        </div>
      </motion.div>

      {/* Order Details & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Purchased Items List */}
        <div className="lg:col-span-8 neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl">
          <h2 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Items Ordered</span>
            <span className="text-xs text-slate-400 font-semibold">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </span>
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id || item.product}
                className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={getProductImageUrl(item.product?.images || item.image)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&auto=format';
                    }}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-black text-slate-900 dark:text-white shrink-0">
                  ₹{item.lineTotal.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping Address Snapshot Card */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Shipping Destination
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-extrabold text-slate-900 dark:text-white">
                {order.shippingAddress.fullName} • +91 {order.shippingAddress.phone}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2
                    ? `, ${order.shippingAddress.addressLine2}`
                    : ''}
                  , {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.postalCode}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary Sidebar */}
        <div className="lg:col-span-4 neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl">
          <h2 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Payment Summary
          </h2>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Payment Method</span>
              <Badge variant={order.paymentMethod === 'cod' ? 'warning' : 'primary'} size="sm">
                <span className="uppercase">{order.paymentMethod}</span>
              </Badge>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Payment Status</span>
              <Badge
                variant={order.paymentStatus === 'paid' ? 'success' : 'slate'}
                size="sm"
              >
                <span className="capitalize">{order.paymentStatus}</span>
              </Badge>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Subtotal</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-extrabold">
                  -₹{order.discountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Shipping</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                Total Paid
              </span>
              <span className="text-xl font-black text-primary-600 dark:text-primary-400">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5 pt-2">
            <Link to="/orders" className="block">
              <Button variant="primary" size="md" className="w-full font-bold rounded-xl">
                <span>View Order History</span>
              </Button>
            </Link>

            <Link to="/shop" className="block">
              <Button variant="outline" size="md" className="w-full font-bold rounded-xl">
                <span>Continue Shopping</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

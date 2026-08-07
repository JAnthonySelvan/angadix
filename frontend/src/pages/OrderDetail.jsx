import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  XCircle,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Download,
  Printer,
  Truck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchOrderById,
  cancelOrder,
  verifyPayment,
  downloadInvoice,
  regenerateInvoice,
  fetchOrderTimeline,
} from '../features/checkout/orderThunks';
import { selectSelectedOrder } from '../features/checkout/orderSlice';
import { loadRazorpayScript } from '../utils/loadRazorpayScript';
import { triggerInvoiceDownload, triggerInvoicePrint } from '../utils/invoiceFile';
import { isInvoiceAvailable, getProductImageUrl } from '../utils/orderHelpers';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export const OrderDetail = () => {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const { data: order, loading, error } = useAppSelector(selectSelectedOrder);
  const user = useAppSelector((state) => state.auth.user);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isRegeneratingInvoice, setIsRegeneratingInvoice] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  // Poll lightweight timeline endpoint every 20 seconds while order is active
  useEffect(() => {
    if (!orderId || !order) return;

    const terminalStatuses = ['delivered', 'cancelled', 'returned', 'refunded'];
    if (terminalStatuses.includes(order.orderStatus)) return;

    const intervalId = setInterval(() => {
      dispatch(fetchOrderTimeline(orderId));
    }, 20000);

    return () => clearInterval(intervalId);
  }, [dispatch, orderId, order?.orderStatus]);

  const handleDownloadInvoice = async () => {
    if (isDownloadingInvoice || !order) return;
    setIsDownloadingInvoice(true);
    try {
      const res = await dispatch(downloadInvoice(order._id)).unwrap();
      triggerInvoiceDownload(res.blob, order.orderNumber);
      toast.success('Invoice downloaded successfully.');
    } catch (err) {
      toast.error(err || 'Invoice is not available until payment is confirmed.');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (isDownloadingInvoice || !order) return;
    setIsDownloadingInvoice(true);
    try {
      const res = await dispatch(downloadInvoice(order._id)).unwrap();
      triggerInvoicePrint(res.blob);
      toast.success('Opening print dialog...');
    } catch (err) {
      toast.error(err || 'Invoice is not available until payment is confirmed.');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handleRegenerateInvoice = async () => {
    if (isRegeneratingInvoice || !order) return;
    setIsRegeneratingInvoice(true);
    try {
      await dispatch(regenerateInvoice(order._id)).unwrap();
      toast.success('Invoice regenerated successfully!');
      dispatch(fetchOrderById(order._id));
    } catch (err) {
      toast.error(err || 'Failed to regenerate invoice.');
    } finally {
      setIsRegeneratingInvoice(false);
    }
  };

  const handleCancelOrder = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ id: order._id, reason: cancelReason })).unwrap();
      toast.success('Order cancelled successfully.');
      setIsCancelModalOpen(false);
      dispatch(fetchOrderById(order._id));
    } catch (err) {
      toast.error(err || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetryPayment = async () => {
    if (isRetryingPayment || !order) return;
    setIsRetryingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Unable to load Razorpay payment gateway. Please check your connection.');
        setIsRetryingPayment(false);
        return;
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const options = {
        key: rzpKey,
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        order_id: order.razorpayOrderId,
        name: 'Angadix',
        description: `Order #${order.orderNumber}`,
        image: '/favicon.svg',
        prefill: {
          name: order.shippingAddress?.fullName || '',
          contact: order.shippingAddress?.phone || '',
        },
        theme: { color: '#0266C8' },
        handler: async (response) => {
          try {
            await dispatch(
              verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              })
            ).unwrap();

            toast.success('Payment verified successfully!');
            dispatch(fetchOrderById(order._id));
          } catch (err) {
            toast.error('Payment verification failed.');
          } finally {
            setIsRetryingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsRetryingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment retry.');
      setIsRetryingPayment(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" color="primary" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Order Not Found
        </h2>
        <p className="text-xs text-rose-500">{error}</p>
        <Link to="/orders">
          <Button variant="primary" size="md">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);
  const canRetryPayment =
    order.paymentMethod === 'razorpay' &&
    order.paymentStatus === 'pending' &&
    ['pending', 'confirmed'].includes(order.orderStatus);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Order History</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {isInvoiceAvailable(order) && (
            <>
              <Button
                variant="outline"
                size="sm"
                isLoading={isDownloadingInvoice}
                isDisabled={isDownloadingInvoice}
                onClick={handleDownloadInvoice}
                className="rounded-xl font-bold text-xs"
              >
                <Download size={14} className="mr-1" />
                <span>Download Invoice</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                isLoading={isDownloadingInvoice}
                isDisabled={isDownloadingInvoice}
                onClick={handlePrintInvoice}
                className="rounded-xl font-bold text-xs"
              >
                <Printer size={14} className="mr-1" />
                <span>Print Invoice</span>
              </Button>
            </>
          )}

          {user?.role === 'admin' && isInvoiceAvailable(order) && (
            <Button
              variant="ghost"
              size="sm"
              isLoading={isRegeneratingInvoice}
              isDisabled={isRegeneratingInvoice}
              onClick={handleRegenerateInvoice}
              title="Force Regenerate Invoice"
              className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <RefreshCw size={14} className={isRegeneratingInvoice ? 'animate-spin' : ''} />
            </Button>
          )}

          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="rounded-xl font-bold text-xs"
            >
              <XCircle size={14} className="mr-1" />
              <span>Cancel Order</span>
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Reference
              </span>
              <Badge variant="primary" size="sm">
                <span className="uppercase">{order.orderNumber}</span>
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
              <Clock size={13} />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="slate" size="md">
              <span className="capitalize">Status: {order.orderStatus}</span>
            </Badge>
            <Badge
              variant={order.paymentStatus === 'paid' ? 'success' : 'slate'}
              size="md"
            >
              <span className="capitalize">Payment: {order.paymentStatus}</span>
            </Badge>
          </div>
        </div>

        {/* Retry Payment Warning Callout */}
        {canRetryPayment && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-semibold">
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              <span>
                Payment pending for this order. Click below to complete your transaction via Razorpay.
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              isLoading={isRetryingPayment}
              onClick={handleRetryPayment}
              className="rounded-xl font-bold shrink-0"
            >
              <RefreshCw size={14} className="mr-1" />
              <span>Retry Online Payment</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items List & Order Tracking Timeline */}
        <div className="lg:col-span-8 space-y-8">
          {/* Purchased Items List */}
          <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Purchased Items ({order.items.length})
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
          </div>

          {/* Order Tracking Timeline Component */}
          <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-primary-600" />
              <span>Order Fulfillment Timeline</span>
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((history, idx) => {
                  const isLatest = idx === order.statusHistory.length - 1;
                  const timeFormatted = new Date(history.changedAt).toLocaleString(
                    'en-IN',
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  );

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isLatest
                            ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/30'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isLatest ? 'bg-white' : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white capitalize">
                            Status: {history.status}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {timeFormatted}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {history.note}
                          </p>
                        )}

                        {/* Shipment Details Sub-row for Shipped Step */}
                        {history.status === 'shipped' &&
                          order.shipment &&
                          (order.shipment.carrier || order.shipment.trackingNumber) && (
                            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-2">
                              <Truck size={14} className="text-primary-600 shrink-0" />
                              <span>
                                {order.shipment.carrier ? `Carrier: ${order.shipment.carrier}` : ''}
                                {order.shipment.carrier && order.shipment.trackingNumber ? ' | ' : ''}
                                {order.shipment.trackingNumber
                                  ? `Tracking #: ${order.shipment.trackingNumber}`
                                  : ''}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">No status history available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Address & Payment Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address Card */}
          <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shipping Destination
            </h3>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-extrabold text-slate-900 dark:text-white">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-slate-500 font-medium">
                +91 {order.shippingAddress.phone}
              </p>
              <p className="flex items-start gap-1.5 pt-1">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
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

          {/* Payment Summary Sidebar Card */}
          <div className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Financial Breakdown
            </h3>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Payment Method</span>
                <span className="font-extrabold text-slate-900 dark:text-white uppercase">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
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

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Total Amount
                </span>
                <span className="text-xl font-black text-primary-600 dark:text-primary-400">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order Confirmation"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to cancel order #{order.orderNumber}? Product stock will be restored immediately.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Ordered by mistake, changed mind..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-primary-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCancelModalOpen(false)}
              isDisabled={isCancelling}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isCancelling}
              isDisabled={isCancelling}
              onClick={handleCancelOrder}
            >
              Confirm Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

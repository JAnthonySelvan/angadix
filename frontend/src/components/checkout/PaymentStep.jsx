import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createOrder, verifyPayment } from '../../features/checkout/orderThunks';
import { selectAddresses } from '../../features/checkout/addressSlice';
import { clearCartState } from '../../features/cart/cartSlice';
import { loadRazorpayScript } from '../../utils/loadRazorpayScript';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

export const PaymentStep = ({ selectedAddressId, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const addresses = useAppSelector(selectAddresses);
  const address = addresses.find((a) => a._id === selectedAddressId);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingText, setLoadingText] = useState(t('checkout.placingOrder', 'Processing your order...'));

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address before proceeding.');
      return;
    }

    setIsPlacingOrder(true);
    setLoadingText(t('checkout.placingOrder', 'Processing your order...'));

    try {
      // 1. Dispatch createOrder thunk
      const response = await dispatch(
        createOrder({
          shippingAddressId: selectedAddressId,
          paymentMethod,
        })
      ).unwrap();

      // 2. Handle COD Path
      if (paymentMethod === 'cod') {
        const order = response.order || response;
        dispatch(clearCartState());
        toast.success(t('toasts.orderPlaced', 'Order placed successfully with Cash on Delivery!'));
        navigate(`/order-success/${order._id}`);
        return;
      }

      // 3. Handle Razorpay Path
      if (paymentMethod === 'razorpay') {
        setLoadingText(t('checkout.placingOrder', 'Loading secure payment gateway...'));
        const isLoaded = await loadRazorpayScript();

        if (!isLoaded) {
          toast.error(
            'Unable to load payment gateway. Please check your internet connection and try again.'
          );
          setIsPlacingOrder(false);
          return;
        }

        const options = {
          key:
            response.razorpayOrder?.key ||
            response.razorpayKeyId ||
            import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.razorpayOrder.amount,
          currency: response.razorpayOrder.currency,
          name: 'Angadix Store',
          description: `Order Payment #${response.order._id.substring(0, 8)}`,
          order_id: response.razorpayOrder.id,
          handler: async (razorpayRes) => {
            try {
              setLoadingText(t('checkout.placingOrder', 'Verifying payment...'));
              await dispatch(
                verifyPayment({
                  orderId: response.order._id,
                  razorpay_payment_id: razorpayRes.razorpay_payment_id,
                  razorpay_order_id: razorpayRes.razorpay_order_id,
                  razorpay_signature: razorpayRes.razorpay_signature,
                })
              ).unwrap();

              dispatch(clearCartState());
              toast.success(t('toasts.orderPlaced', 'Payment successful! Order confirmed.'));
              navigate(`/order-success/${response.order._id}`);
            } catch (verErr) {
              toast.error(verErr || 'Payment verification failed.');
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: user?.name || address?.fullName || '',
            email: user?.email || '',
            contact: address?.phone || '',
          },
          theme: {
            color: '#0266C8',
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled by user.');
              setIsPlacingOrder(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      }
    } catch (err) {
      toast.error(err || 'Failed to place order.');
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {t('checkout.stepPayment', 'Payment Method')}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          {t('checkout.paymentMethod', 'Select your preferred payment option')}
        </p>
      </div>

      {/* Payment Options List */}
      <div className="space-y-3">
        {/* Razorpay Online Payment Card */}
        <div
          onClick={() => !isPlacingOrder && setPaymentMethod('razorpay')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'razorpay'
              ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-lg shadow-primary-600/10'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
                <CreditCard size={22} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {t('checkout.onlinePayment', 'Online Payment / Card / UPI')}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {t('checkout.onlinePaymentDesc', 'Fast, secure payment via Razorpay / Credit / Debit / NetBanking')}
                </p>
              </div>
            </div>

            {paymentMethod === 'razorpay' && (
              <CheckCircle2 size={22} className="fill-primary-600 text-white shrink-0" />
            )}
          </div>
        </div>

        {/* Cash on Delivery Card */}
        <div
          onClick={() => !isPlacingOrder && setPaymentMethod('cod')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'cod'
              ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-lg shadow-primary-600/10'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <Banknote size={22} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {t('checkout.cod', 'Cash on Delivery (COD)')}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {t('checkout.codDesc', 'Pay cash when your order is delivered to your doorstep')}
                </p>
              </div>
            </div>

            {paymentMethod === 'cod' && (
              <CheckCircle2 size={22} className="fill-primary-600 text-white shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Lock size={18} className="text-primary-600 flex-shrink-0" />
        <span>
          {t('footer.securePayment', 'Your transaction details are encrypted with 256-Bit SSL security.')}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          isDisabled={isPlacingOrder}
          className="rounded-2xl font-bold flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>{t('common.back', 'Back')}</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          isLoading={isPlacingOrder}
          isDisabled={isPlacingOrder}
          onClick={handlePlaceOrder}
          className="rounded-2xl font-black px-8"
        >
          <span>{isPlacingOrder ? loadingText : t('checkout.placeOrder', 'Place Order')}</span>
        </Button>
      </div>
    </div>
  );
};

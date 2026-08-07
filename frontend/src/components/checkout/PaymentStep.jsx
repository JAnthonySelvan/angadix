import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createOrder, verifyPayment } from '../../features/checkout/orderThunks';
import { selectAddresses } from '../../features/checkout/addressSlice';
import { clearCartState } from '../../features/cart/cartSlice';
import { loadRazorpayScript } from '../../utils/loadRazorpayScript';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

export const PaymentStep = ({ selectedAddressId, onBack }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const addresses = useAppSelector(selectAddresses);
  const address = addresses.find((a) => a._id === selectedAddressId);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing your order...');

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address before proceeding.');
      return;
    }

    setIsPlacingOrder(true);
    setLoadingText('Processing your order...');

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
        toast.success('Order placed successfully with Cash on Delivery!');
        navigate(`/order-success/${order._id}`);
        return;
      }

      // 3. Handle Razorpay Path
      if (paymentMethod === 'razorpay') {
        setLoadingText('Loading secure payment gateway...');
        const isLoaded = await loadRazorpayScript();

        if (!isLoaded) {
          toast.error(
            'Unable to load payment gateway. Please check your internet connection and try again.'
          );
          setIsPlacingOrder(false);
          return;
        }

        const { order, razorpayOrder } = response;
        const rzpKey =
          razorpayOrder?.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

        setLoadingText('Awaiting payment completion...');

        const options = {
          key: rzpKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          order_id: razorpayOrder.id,
          name: 'Angadix',
          description: `Order #${order.orderNumber}`,
          image: '/favicon.svg',
          prefill: {
            name: user?.name || address?.fullName || '',
            email: user?.email || '',
            contact: address?.phone || '',
          },
          theme: {
            color: '#0266C8',
          },
          handler: async (paymentResponse) => {
            try {
              setLoadingText('Verifying payment signature...');
              const verifiedOrder = await dispatch(
                verifyPayment({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  orderId: order._id,
                })
              ).unwrap();

              dispatch(clearCartState());
              toast.success('Payment verified successfully!');
              navigate(`/order-success/${verifiedOrder._id || order._id}`);
            } catch (err) {
              toast.error(
                `Payment received but confirmation is taking longer than expected. Check Order History in a moment — if the order doesn't appear, contact support with reference ${order.orderNumber}.`
              );
              setIsPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast.error(
                'Payment cancelled. Your order is saved as pending — you can retry from Order History.'
              );
              setIsPlacingOrder(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error(error || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Payment Method
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Select how you would like to complete your transaction
        </p>
      </div>

      {/* Payment Options Grid */}
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
                    Pay Online (Razorpay)
                  </h3>
                  <Badge variant="primary" size="sm">
                    Instant Confirmation
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Credit / Debit Cards, UPI (GPay, PhonePe, Paytm), NetBanking, & Wallets
                </p>

                {/* Accepted Icons Row */}
                <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    UPI
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Cards
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    NetBanking
                  </span>
                </div>
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
                    Cash on Delivery (COD)
                  </h3>
                  <Badge variant="success" size="sm">
                    No Extra Fee
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Pay via cash or UPI directly to the courier executive upon delivery
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
          Your transaction details are encrypted with 256-Bit SSL security. Angadix never stores your card credentials.
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
          <span>Back to Delivery</span>
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
          <span>{isPlacingOrder ? loadingText : 'Place Order'}</span>
        </Button>
      </div>
    </div>
  );
};

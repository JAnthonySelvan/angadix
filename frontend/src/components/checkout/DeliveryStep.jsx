import React from 'react';
import { Truck, MapPin, Phone, CheckCircle2, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import { selectAddresses } from '../../features/checkout/addressSlice';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const DeliveryStep = ({ selectedAddressId, onBack, onNext }) => {
  const { t } = useTranslation();
  const addresses = useAppSelector(selectAddresses);
  const address = addresses.find((a) => a._id === selectedAddressId) || addresses[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {t('checkout.stepDelivery', 'Delivery Options')}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          {t('checkout.standardShippingDesc', 'Select your preferred shipping method')}
        </p>
      </div>

      {/* Selected Address Snapshot Summary */}
      {address && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('order.shippingAddress', 'Delivering To')}:
              </span>
              <Badge variant="slate" size="sm">
                <span className="capitalize">{address.type}</span>
              </Badge>
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {address.fullName} • <span className="text-slate-500 font-normal">+91 {address.phone}</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span>
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city},{' '}
                {address.state} - {address.postalCode}
              </span>
            </p>
          </div>

          <button
            onClick={onBack}
            className="text-xs font-extrabold text-primary-600 dark:text-primary-400 hover:underline shrink-0"
          >
            {t('common.edit', 'Change Address')}
          </button>
        </div>
      )}

      {/* Delivery Method Option Card */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t('checkout.stepDelivery', 'Shipping Tier')}
        </label>

        <div className="p-5 rounded-2xl border-2 border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 flex items-center justify-between gap-4 shadow-lg shadow-primary-600/10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
              <Truck size={22} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {t('checkout.standardShipping', 'Angadix Standard Express Shipping')}
                </h3>
                <Badge variant="success" size="sm">
                  {t('cart.free', 'FREE')}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span>{t('checkout.standardShippingDesc', 'Estimated Delivery: 3 to 5 Business Days')}</span>
              </p>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <ShieldCheck size={13} />
                <span>{t('home.features.authentic', 'Insured & Tracked Express Parcel')}</span>
              </p>
            </div>
          </div>

          <CheckCircle2 size={22} className="fill-primary-600 text-white shrink-0" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-2xl font-bold flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>{t('common.back', 'Back to Address')}</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          className="rounded-2xl font-black px-8"
        >
          <span>{t('common.continue', 'Continue to Payment')}</span>
        </Button>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, CheckCircle2, MapPin, Phone, Home, Briefcase, Tag, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../../features/checkout/addressThunks';
import {
  selectAddresses,
  selectAddressStatus,
} from '../../features/checkout/addressSlice';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { AddressForm } from './AddressForm';
import toast from 'react-hot-toast';

export const AddressStep = ({ selectedAddressId, onSelectAddress, onNext }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const status = useAppSelector(selectAddressStatus);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Auto select default address or first address once addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr && defaultAddr._id) {
        onSelectAddress(defaultAddr._id);
      }
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  const handleOpenAddModal = useCallback(() => {
    setEditingAddress(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((addr, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setEditingAddress(addr);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAddress(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        if (editingAddress) {
          const result = await dispatch(
            updateAddress({ id: editingAddress._id, data: formData })
          ).unwrap();
          toast.success(t('toasts.addressUpdated', 'Address updated successfully.'));
          if (result?._id) {
            onSelectAddress(result._id);
          }
        } else {
          const result = await dispatch(createAddress(formData)).unwrap();
          toast.success(t('toasts.addressAdded', 'Address added successfully.'));
          if (result?._id) {
            onSelectAddress(result._id);
          }
        }
        setIsModalOpen(false);
        setEditingAddress(null);
      } catch (err) {
        toast.error(err || t('common.error', 'Failed to save address.'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, editingAddress, isSubmitting, onSelectAddress, t]
  );

  const handleDelete = useCallback(
    async (id, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      try {
        await dispatch(deleteAddress(id)).unwrap();
        toast.success(t('toasts.addressDeleted', 'Address deleted.'));
        if (selectedAddressId === id) {
          const remaining = addresses.filter((a) => a._id !== id);
          onSelectAddress(remaining.length > 0 ? remaining[0]._id : null);
        }
      } catch (err) {
        toast.error(err || t('common.error', 'Failed to delete address.'));
      } finally {
        setDeletingId(null);
      }
    },
    [dispatch, addresses, selectedAddressId, onSelectAddress, t]
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'work':
        return <Briefcase size={14} />;
      case 'other':
        return <Tag size={14} />;
      default:
        return <Home size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {t('checkout.selectShippingAddress', 'Select Shipping Address')}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {t('checkout.selectShippingAddressSub', 'Choose where you want your Angadix order delivered')}
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="secondary"
          size="sm"
          className="inline-flex items-center gap-1.5 rounded-xl font-bold"
        >
          <Plus size={16} />
          <span>{t('checkout.addNewAddress', 'Add New Address')}</span>
        </Button>
      </div>

      {/* Loading Skeleton */}
      {status === 'loading' && addresses.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={160} className="rounded-2xl" />
          <Skeleton height={160} className="rounded-2xl" />
        </div>
      )}

      {/* Address Cards List */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr._id;

            return (
              <motion.div
                key={addr._id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectAddress(addr._id)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary-600 dark:border-sky-400 bg-primary-50/70 dark:bg-slate-800/90 shadow-lg shadow-primary-600/10 dark:shadow-sky-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 text-primary-600 dark:text-sky-400">
                    <CheckCircle2 size={20} className="fill-primary-600 dark:fill-sky-400 text-white dark:text-slate-950" />
                  </div>
                )}

                {/* Type & Default Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={isSelected ? 'primary' : 'slate'} size="sm">
                    {getTypeIcon(addr.type)}
                    <span className="capitalize">{addr.type}</span>
                  </Badge>
                  {addr.isDefault && (
                    <Badge variant="success" size="sm">
                      {t('checkout.default', 'Default')}
                    </Badge>
                  )}
                </div>

                {/* Person Info */}
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{addr.fullName}</span>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-200 font-semibold flex items-center gap-1.5 mt-1">
                  <Phone size={13} className="text-primary-600 dark:text-sky-400" />
                  <span>+91 {addr.phone}</span>
                </p>

                {/* Formatted Address */}
                <div className="text-xs text-slate-700 dark:text-slate-100 font-medium mt-2 leading-relaxed flex items-start gap-1.5">
                  <MapPin size={14} className="text-primary-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city},{' '}
                    {addr.state} - {addr.postalCode}, {addr.country}
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEditModal(addr, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-1"
                    title="Edit address"
                  >
                    <Edit2 size={13} />
                    <span>{t('common.edit', 'Edit')}</span>
                  </button>

                  {deletingId === addr._id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-600">{t('checkout.confirm', 'Confirm?')}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(addr._id, e)}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                      >
                        {t('checkout.yes', 'Yes')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold"
                      >
                        {t('checkout.no', 'No')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(addr._id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs font-bold flex items-center gap-1"
                      title="Delete address"
                    >
                      <Trash2 size={13} />
                      <span>{t('common.delete', 'Delete')}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State Banner */}
      {status === 'succeeded' && addresses.length === 0 && (
        <div className="neu-card p-8 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center space-y-3">
          <AlertTriangle size={32} className="text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {t('checkout.noAddressFound', 'No Shipping Address Found')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('checkout.noAddressSub', 'Please add a delivery address to proceed with your order checkout.')}
          </p>
          <Button onClick={handleOpenAddModal} variant="primary" size="sm">
            {t('checkout.addAddressNow', 'Add Address Now')}
          </Button>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAddress ? t('address.editAddress', 'Edit Shipping Address') : t('checkout.addNewAddress', 'Add New Shipping Address')}
        maxWidth="max-w-lg"
      >
        <AddressForm
          key={editingAddress?._id || (isModalOpen ? 'add-modal' : 'closed')}
          initialValues={editingAddress}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Continue Button */}
      <div className="pt-4 flex justify-end">
        <Button
          onClick={onNext}
          variant="primary"
          size="lg"
          isDisabled={!selectedAddressId}
          className="rounded-2xl font-black px-8"
        >
          <span>{t('checkout.continueToDelivery', 'Continue to Delivery')}</span>
        </Button>
      </div>
    </div>
  );
};

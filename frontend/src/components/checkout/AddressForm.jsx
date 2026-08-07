import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, MapPin, Building, Home, Briefcase, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, 'Postal code must be a 6-digit number'),
  country: z.string().default('India'),
  type: z.enum(['home', 'work', 'other']).default('home'),
  isDefault: z.boolean().default(false),
});

export const AddressForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      phone: initialValues?.phone || '',
      addressLine1: initialValues?.addressLine1 || '',
      addressLine2: initialValues?.addressLine2 || '',
      city: initialValues?.city || '',
      state: initialValues?.state || '',
      postalCode: initialValues?.postalCode || '',
      country: initialValues?.country || 'India',
      type: initialValues?.type || 'home',
      isDefault: Boolean(initialValues?.isDefault),
    },
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="e.g. John Doe"
        leftIcon={<User size={18} />}
        error={errors.fullName?.message}
        required
        {...register('fullName')}
      />

      <Input
        label="10-Digit Mobile Number"
        placeholder="e.g. 9876543210"
        leftIcon={<Phone size={18} />}
        error={errors.phone?.message}
        required
        {...register('phone')}
      />

      <Input
        label="Address Line 1 (House/Flat No, Building)"
        placeholder="e.g. Flat 402, Royal Enclave"
        leftIcon={<MapPin size={18} />}
        error={errors.addressLine1?.message}
        required
        {...register('addressLine1')}
      />

      <Input
        label="Address Line 2 (Street, Area, Landmark)"
        placeholder="e.g. Near Central Park, MG Road"
        leftIcon={<Building size={18} />}
        error={errors.addressLine2?.message}
        {...register('addressLine2')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City / Town"
          placeholder="e.g. Bengaluru"
          error={errors.city?.message}
          required
          {...register('city')}
        />

        <Input
          label="State"
          placeholder="e.g. Karnataka"
          error={errors.state?.message}
          required
          {...register('state')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="6-Digit Postal Code"
          placeholder="e.g. 560001"
          error={errors.postalCode?.message}
          required
          {...register('postalCode')}
        />

        <Input
          label="Country"
          placeholder="India"
          disabled
          {...register('country')}
        />
      </div>

      {/* Address Type Segmented Selector */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Address Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'work', label: 'Work', icon: Briefcase },
            { id: 'other', label: 'Other', icon: Tag },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setValue('type', id, { shouldValidate: true })}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                selectedType === id
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Set Default Checkbox */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
            {...register('isDefault')}
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Set as default shipping address
          </span>
        </label>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {initialValues ? 'Save Changes' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};

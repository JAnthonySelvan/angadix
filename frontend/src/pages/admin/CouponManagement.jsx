import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Edit2, Trash2 } from 'lucide-react';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminSearchBar } from '../../components/admin/AdminSearchBar';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm dialog
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons', {
        params: {
          code: search.trim() || undefined,
          isActive: activeFilter !== '' ? activeFilter : undefined,
        },
      });
      setCoupons(res.data.data.coupons || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [search, activeFilter]);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code || '');
      setDescription(coupon.description || '');
      setDiscountType(coupon.discountType || 'percentage');
      setDiscountValue(coupon.discountValue || '');
      setMaxDiscountAmount(coupon.maxDiscountAmount || '');
      setMinOrderValue(coupon.minOrderValue || '');
      setUsageLimit(coupon.usageLimit || '');
      setValidFrom(coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 10) : '');
      setValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 10) : '');
      setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
    } else {
      setEditingCoupon(null);
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('');
      setMaxDiscountAmount('');
      setMinOrderValue('');
      setUsageLimit('');
      const today = new Date().toISOString().slice(0, 10);
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setValidFrom(today);
      setValidUntil(nextMonth);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error('Coupon code and discount value are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: parseFloat(discountValue),
        maxDiscountAmount:
          discountType === 'percentage' && maxDiscountAmount
            ? parseFloat(maxDiscountAmount)
            : undefined,
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        isActive,
      };

      if (editingCoupon) {
        await api.patch(`/coupons/${editingCoupon._id}`, payload);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created successfully');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (coupon) => {
    setConfirmState({
      isOpen: true,
      title: 'Deactivate Coupon',
      message: `Are you sure you want to deactivate coupon code '${coupon.code}'?`,
      action: async () => {
        try {
          await api.delete(`/coupons/${coupon._id}`);
          toast.success('Coupon deactivated successfully');
          fetchCoupons();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to deactivate coupon');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const columns = [
    {
      key: 'code',
      label: 'Coupon Code',
      render: (c) => (
        <div>
          <span className="font-mono font-black text-sm text-primary-600 dark:text-primary-400 tracking-wider block">
            {c.code}
          </span>
          {c.description && (
            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
              {c.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (c) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">
            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
          </span>
          {c.discountType === 'percentage' && c.maxDiscountAmount && (
            <span className="text-[10px] text-slate-400 block">
              Max cap: {formatCurrency(c.maxDiscountAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'minOrderValue',
      label: 'Min Order',
      render: (c) => formatCurrency(c.minOrderValue),
    },
    {
      key: 'validity',
      label: 'Valid Until',
      render: (c) => (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {new Date(c.validUntil).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'usage',
      label: 'Usage Count',
      render: (c) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {c.usedCount || 0} / {c.usageLimit || '∞'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (c) => <StatusBadge type="coupon" value={c} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenModal(c)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(c)}
            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
            title="Deactivate"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Coupon & Discount Management
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Create promotional discount codes, validity windows, and usage caps
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-md shadow-primary-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Admin Search Bar */}
      <AdminSearchBar
        placeholder="Search coupons by code..."
        value={search}
        onChange={(val) => setSearch(val)}
      >
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent outline-none font-medium"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </AdminSearchBar>

      {/* Admin Table */}
      <AdminTable
        columns={columns}
        data={coupons}
        loading={loading}
        emptyMessage="No promotional coupons created yet."
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Promotional Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-mono font-bold uppercase"
                placeholder="e.g. FESTIVE20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-bold"
                placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
              />
            </div>
            {discountType === 'percentage' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Discount Cap (₹)
                </label>
                <input
                  type="number"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                  placeholder="Optional max cap"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                placeholder="e.g. 1000"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Usage Limit (Total)
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                placeholder="Optional overall cap"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Valid From Date *
              </label>
              <input
                type="date"
                required
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Valid Until Date *
              </label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCoupon"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActiveCoupon" className="font-bold text-slate-700 dark:text-slate-300">
              Active for Redemption
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

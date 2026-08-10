import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ArrowUpDown,
  Check,
  Link as LinkIcon,
  Package,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAdminFeaturedShowcase,
  createAdminFeaturedShowcase,
  updateAdminFeaturedShowcase,
  deleteAdminFeaturedShowcase,
} from '../../features/admin/featuredShowcaseThunks';
import { fetchAdminProducts } from '../../features/admin/adminProductsThunks';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const FeaturedShowcaseManagement = () => {
  const dispatch = useAppDispatch();
  const { items = [], loading = false } = useAppSelector((state) => state.adminFeaturedShowcase || {});
  const products = useAppSelector((state) => state.adminProducts.products || state.adminProducts.items) || [];
  const [allProducts, setAllProducts] = useState([]);

  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('');
  const [linkedProduct, setLinkedProduct] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    dispatch(fetchAdminFeaturedShowcase());
    dispatch(fetchAdminProducts({ limit: 100 }));
    api.get('/products?limit=100')
      .then((res) => {
        const list = res.data?.data?.products || res.data?.data || [];
        if (Array.isArray(list)) setAllProducts(list);
      })
      .catch(() => {});
  }, [dispatch]);

  const availableProducts = products.length > 0 ? products : allProducts;

  const handleOpenSlideOver = (item = null) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title || '');
      setDescription(item.description || '');
      setCtaText(item.ctaText || 'Shop Now');
      setCtaLink(item.ctaLink || '');
      setLinkedProduct(item.linkedProduct?._id || item.linkedProduct || '');
      setSortOrder(String(item.sortOrder ?? 0));
      setIsActive(item.isActive !== undefined ? item.isActive : true);
      setPreviewUrl(item.image?.url || '');
    } else {
      setEditingItem(null);
      setTitle('');
      setDescription('');
      setCtaText('Shop Now');
      setCtaLink('');
      setLinkedProduct('');
      setSortOrder('0');
      setIsActive(true);
      setPreviewUrl('');
    }
    setImageFile(null);
    setIsSlideOverOpen(true);
  };

  const handleImageChange = (file) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Showcase title is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Showcase description is required');
      return;
    }
    if (!editingItem && !imageFile && !previewUrl) {
      toast.error('Showcase image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('ctaText', ctaText.trim());
      formData.append('ctaLink', ctaLink.trim());
      formData.append('linkedProduct', linkedProduct || '');
      formData.append('sortOrder', sortOrder);
      formData.append('isActive', isActive);
      if (imageFile) formData.append('image', imageFile);

      if (editingItem) {
        await dispatch(updateAdminFeaturedShowcase({ id: editingItem._id, formData })).unwrap();
        toast.success('Featured showcase updated successfully');
      } else {
        await dispatch(createAdminFeaturedShowcase(formData)).unwrap();
        toast.success('Featured showcase created successfully');
      }

      setIsSlideOverOpen(false);
      dispatch(fetchAdminFeaturedShowcase());
    } catch (err) {
      toast.error(err || 'Failed to save showcase entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Featured Showcase',
      message: `Are you sure you want to delete '${item.title}'?`,
      action: async () => {
        try {
          await dispatch(deleteAdminFeaturedShowcase(item._id)).unwrap();
          toast.success('Showcase entry deleted successfully');
        } catch (err) {
          toast.error(err || 'Failed to delete entry');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={16} />
            <span>Storefront Highlights</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Featured Showcase Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage custom featured cards displayed in the Home page showcase section.
          </p>
        </div>

        <button
          onClick={() => handleOpenSlideOver()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={16} />
          <span>Add Showcase Entry</span>
        </button>
      </div>

      {/* Grid of Showcase Cards */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
              <Skeleton className="w-full h-48 rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 max-w-xl mx-auto">
          <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No Showcase Cards Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Create your first custom showcase entry to highlight special products or collections on the Home page.
          </p>
          <button
            onClick={() => handleOpenSlideOver()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-all"
          >
            <Plus size={16} />
            <span>Create First Entry</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item._id}
              layout
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Image Preview */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={32} />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-black/60 backdrop-blur-md text-white">
                      Order: {item.sortOrder ?? 0}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Links / Info Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 pt-1">
                    {item.linkedProduct && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                        <Package size={12} />
                        <span className="truncate max-w-[140px]">{item.linkedProduct.name}</span>
                      </span>
                    )}
                    {item.ctaLink && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <LinkIcon size={12} />
                        <span className="truncate max-w-[140px]">{item.ctaLink}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  CTA: {item.ctaText || 'Shop Now'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenSlideOver(item)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide-over Form Drawer */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSlideOverOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingItem ? 'Edit Showcase Entry' : 'Create Showcase Entry'}
                  </h2>
                  <p className="text-xs text-slate-500">Fill in card title, imagery, and link details.</p>
                </div>
                <button
                  onClick={() => setIsSlideOverOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form id="showcase-form" onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="e.g. Next-Gen Studio Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-transparent focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    placeholder="Brief highlight description for this showcase card..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-transparent focus:border-primary-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Card Image {!editingItem && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="space-y-3">
                    {previewUrl && (
                      <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center p-2">
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-110"
                          style={{ backgroundImage: `url(${previewUrl})` }}
                        />
                        <img src={previewUrl} alt="Preview" className="relative z-10 w-full h-full object-contain" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 dark:file:bg-primary-950 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100 cursor-pointer"
                    />
                  </div>
                </div>

                {/* CTA Button Text & Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      placeholder="Shop Now"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-transparent focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-transparent focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Custom CTA Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /shop?category=headphones"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-transparent focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Linked Product Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Optional Linked Product
                  </label>
                  <select
                    value={linkedProduct}
                    onChange={(e) => setLinkedProduct(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-transparent focus:border-primary-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Product (Optional) --</option>
                    {linkedProduct && !availableProducts.some((p) => p._id === linkedProduct) && (
                      <option value={linkedProduct}>
                        {editingItem?.linkedProduct?.name || 'Selected Product'} ({linkedProduct})
                      </option>
                    )}
                    {availableProducts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (₹{(p.discountPrice || p.salePrice || p.price || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Active Status</p>
                    <p className="text-[11px] text-slate-400">Show this entry on storefront section.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSlideOverOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="showcase-form"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-extrabold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Showcase' : 'Create Showcase'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default FeaturedShowcaseManagement;

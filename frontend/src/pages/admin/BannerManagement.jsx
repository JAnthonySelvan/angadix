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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
} from '../../features/admin/bannerThunks';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const PLACEMENT_TABS = [
  { id: 'all', label: 'All Banners' },
  { id: 'hero', label: 'Hero Carousel (16:9)' },
  { id: 'promo', label: 'Promo Banner (1:1)' },
  { id: 'category', label: 'Category Banner' },
  { id: 'flash-sale', label: 'Flash Sale (Wide)' },
];

export const BannerManagement = () => {
  const dispatch = useAppDispatch();
  const { banners, loading } = useAppSelector((state) => state.adminBanners);

  const [activeTab, setActiveTab] = useState('all');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [placement, setPlacement] = useState('hero');
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
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  const filteredBanners = banners.filter(
    (b) => activeTab === 'all' || b.placement === activeTab
  );

  const handleOpenSlideOver = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || '');
      setSubtitle(banner.subtitle || '');
      setCtaText(banner.ctaText || '');
      setCtaLink(banner.ctaLink || '');
      setPlacement(banner.placement || 'hero');
      setSortOrder(String(banner.sortOrder ?? 0));
      setIsActive(banner.isActive !== undefined ? banner.isActive : true);
      setPreviewUrl(banner.image?.url || '');
    } else {
      setEditingBanner(null);
      setTitle('');
      setSubtitle('');
      setCtaText('');
      setCtaLink('');
      setPlacement(activeTab !== 'all' ? activeTab : 'hero');
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
      toast.error('Banner title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('ctaText', ctaText.trim());
      formData.append('ctaLink', ctaLink.trim());
      formData.append('placement', placement);
      formData.append('sortOrder', sortOrder);
      formData.append('isActive', isActive);
      if (imageFile) formData.append('image', imageFile);

      if (editingBanner) {
        await dispatch(updateAdminBanner({ id: editingBanner._id, formData })).unwrap();
        toast.success('Banner updated successfully');
      } else {
        await dispatch(createAdminBanner(formData)).unwrap();
        toast.success('Banner created successfully');
      }

      setIsSlideOverOpen(false);
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.error(err || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (banner) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Banner',
      message: `Are you sure you want to delete banner '${banner.title}'?`,
      action: async () => {
        try {
          await dispatch(deleteAdminBanner(banner._id)).unwrap();
          toast.success('Banner deleted successfully');
        } catch (err) {
          toast.error(err || 'Failed to delete banner');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSortOrderChange = async (bannerId, newSortOrder) => {
    try {
      await api.patch('/banners/reorder', {
        items: [{ id: bannerId, sortOrder: parseInt(newSortOrder, 10) }],
      });
      toast.success('Banner order updated');
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.error('Failed to reorder banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Banner & Promotional Media
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage storefront hero carousels, promo cards, and placement order
          </p>
        </div>
        <button
          onClick={() => handleOpenSlideOver()}
          className="px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-md shadow-primary-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Placement Filter Tabs */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-wrap items-center gap-2">
        {PLACEMENT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive Visual Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      ) : filteredBanners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <motion.div
              key={banner._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
            >
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200/60 dark:border-slate-700/60">
                {banner.image?.url ? (
                  <img
                    src={banner.image.url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon size={36} />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider">
                    {banner.placement}
                  </span>
                  <StatusBadge type="active" value={banner.isActive} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-outfit truncate">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Sort:</span>
                    <input
                      type="number"
                      defaultValue={banner.sortOrder}
                      onBlur={(e) => handleSortOrderChange(banner._id, e.target.value)}
                      className="w-12 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-bold text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
                {banner.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]">
                  CTA: {banner.ctaText || 'None'} ({banner.ctaLink || '#'})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenSlideOver(banner)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(banner)}
                    className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold">
          No banners found for selected placement filter.
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
      />

      {/* Slide-over Form Panel */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md h-full border-l border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h3>
                <button
                  onClick={() => setIsSlideOverOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="e.g. Festival Special Sale"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="e.g. Up to 40% OFF on all electronics"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Placement
                    </label>
                    <select
                      value={placement}
                      onChange={(e) => setPlacement(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-bold"
                    >
                      <option value="hero">Hero Carousel (16:9)</option>
                      <option value="promo">Promo Card (1:1)</option>
                      <option value="category">Category Banner</option>
                      <option value="flash-sale">Flash Sale Wide</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                      placeholder="e.g. Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTA Destination Link
                    </label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                      placeholder="e.g. /shop?category=mobile"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Guide Overlay Hint */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Image Image
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">
                    {placement === 'hero'
                      ? 'Recommended aspect ratio: 16:9 wide banner (e.g. 1920x1080px)'
                      : placement === 'promo'
                      ? 'Recommended aspect ratio: 1:1 square image (e.g. 800x800px)'
                      : 'Recommended aspect ratio: 3:1 banner (e.g. 1200x400px)'}
                  </p>
                  {previewUrl && (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden mb-2 border border-slate-200 dark:border-slate-700">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveBanner"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActiveBanner" className="font-bold text-slate-700 dark:text-slate-300">
                    Publish Banner Immediately
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsSlideOverOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Banner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

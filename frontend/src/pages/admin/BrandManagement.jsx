import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Edit2, Trash2, X, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBrands } from '../../features/products/productThunks';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminSearchBar } from '../../components/admin/AdminSearchBar';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const BrandManagement = () => {
  const dispatch = useAppDispatch();
  const brands = useAppSelector((state) => state.products.brands.items);
  const loading = useAppSelector((state) => state.products.brands.loading);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
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
    dispatch(fetchBrands());
  }, [dispatch]);

  const filteredBrands = useMemo(() => {
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.slug.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  const totalBrands = filteredBrands.length;
  const totalPages = Math.ceil(totalBrands / ITEMS_PER_PAGE) || 1;

  const paginatedBrands = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredBrands.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBrands, page]);

  const handleOpenSlideOver = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setName(brand.name || '');
      setDescription(brand.description || '');
      setWebsite(brand.website || '');
      setIsActive(brand.isActive !== undefined ? brand.isActive : true);
      setPreviewUrl(brand.logo?.url || '');
    } else {
      setEditingBrand(null);
      setName('');
      setDescription('');
      setWebsite('');
      setIsActive(true);
      setPreviewUrl('');
    }
    setLogoFile(null);
    setIsSlideOverOpen(true);
  };

  const handleLogoChange = (file) => {
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('website', website.trim());
      formData.append('isActive', isActive);
      if (logoFile) formData.append('logo', logoFile);

      if (editingBrand) {
        await api.patch(`/brands/${editingBrand._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Brand updated successfully');
      } else {
        await api.post('/brands', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Brand created successfully');
      }

      setIsSlideOverOpen(false);
      dispatch(fetchBrands());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (brand) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Brand',
      message: `Are you sure you want to delete brand '${brand.name}'?`,
      action: async () => {
        try {
          await api.delete(`/brands/${brand._id}`);
          toast.success('Brand deleted successfully');
          dispatch(fetchBrands());
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete brand');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Brand',
      render: (b) => (
        <div className="flex items-center gap-3">
          {b.logo?.url ? (
            <img
              src={b.logo.url}
              alt={b.name}
              className="w-9 h-9 rounded-xl object-contain p-1 border border-slate-200 dark:border-slate-700 bg-white"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-slate-800 text-violet-600 flex items-center justify-center">
              <Award size={18} />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{b.name}</p>
            {b.description && (
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {b.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (b) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {b.slug}
        </span>
      ),
    },
    {
      key: 'website',
      label: 'Website',
      render: (b) =>
        b.website ? (
          <a
            href={b.website}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Visit</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          '—'
        ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (b) => <StatusBadge type="active" value={b.isActive} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenSlideOver(b)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(b)}
            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
            title="Delete"
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
            Brand Management
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage manufacturer brand identities, official logos, and external websites
          </p>
        </div>
        <button
          onClick={() => handleOpenSlideOver()}
          className="px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-md shadow-primary-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Brand</span>
        </button>
      </div>

      {/* Search Bar */}
      <AdminSearchBar
        placeholder="Search brands by name or slug..."
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      {/* Table */}
      <AdminTable
        columns={columns}
        data={paginatedBrands}
        loading={loading}
        emptyMessage="No brands created yet."
      />

      {/* Pagination */}
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalBrands}
        onPageChange={(p) => setPage(p)}
      />

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
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
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
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="e.g. Apple, Samsung, Nike"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="Brand history or tagline..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="https://brand.com"
                  />
                </div>

                {/* Logo Preview */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Logo
                  </label>
                  {previewUrl && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-2 border border-slate-200 dark:border-slate-700 p-2 bg-white flex items-center justify-center">
                      <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e.target.files[0])}
                    className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveBrand"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActiveBrand" className="font-bold text-slate-700 dark:text-slate-300">
                    Active on Storefront
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
                    {isSubmitting ? 'Saving...' : 'Save Brand'}
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

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories } from '../../features/products/productThunks';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminSearchBar } from '../../components/admin/AdminSearchBar';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const CategoryManagement = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.products.categories.items);
  const loading = useAppSelector((state) => state.products.categories.loading);

  const [search, setSearch] = useState('');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('');
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
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenSlideOver = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name || '');
      setDescription(category.description || '');
      setParentCategory(category.parentCategory?._id || category.parentCategory || '');
      setIsActive(category.isActive !== undefined ? category.isActive : true);
      setPreviewUrl(category.image?.url || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setParentCategory('');
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
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('isActive', isActive);
      if (parentCategory) formData.append('parentCategory', parentCategory);
      if (imageFile) formData.append('image', imageFile);

      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category created successfully');
      }

      setIsSlideOverOpen(false);
      dispatch(fetchCategories());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category '${category.name}'? Any associated products will be unassigned automatically.`,
      action: async () => {
        try {
          await api.delete(`/categories/${category._id}`);
          toast.success('Category deleted successfully');
          dispatch(fetchCategories());
        } catch (err) {
          toast.error(err.response?.data?.message || err.normalizedMessage || err.message || 'Failed to delete category');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Category',
      render: (cat) => (
        <div className="flex items-center gap-3">
          {cat.image?.url ? (
            <img
              src={cat.image.url}
              alt={cat.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 text-primary-600 flex items-center justify-center">
              <Layers size={18} />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
            {cat.description && (
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {cat.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (cat) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {cat.slug}
        </span>
      ),
    },
    {
      key: 'parentCategory',
      label: 'Parent Category',
      render: (cat) => cat.parentCategory?.name || 'Top-Level',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (cat) => <StatusBadge type="active" value={cat.isActive} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (cat) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenSlideOver(cat)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(cat)}
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Organize catalog taxonomies, parent-child hierarchies, and banner images
          </p>
        </div>
        <button
          onClick={() => handleOpenSlideOver()}
          className="px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-md shadow-primary-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Admin Search Bar */}
      <AdminSearchBar
        placeholder="Search categories by name or slug..."
        value={search}
        onChange={(val) => setSearch(val)}
      />

      {/* Admin Table */}
      <AdminTable
        columns={columns}
        data={filteredCategories}
        loading={loading}
        emptyMessage="No categories created yet."
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
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="e.g. Smartphones & Accessories"
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
                    placeholder="Category details..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter((c) => c._id !== editingCategory?._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Drag-drop / Image upload preview */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Banner Image
                  </label>
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
                    id="isActiveCategory"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActiveCategory" className="font-bold text-slate-700 dark:text-slate-300">
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
                    {isSubmitting ? 'Saving...' : 'Save Category'}
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

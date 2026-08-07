import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  Award,
  Upload,
  Check,
  Boxes,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories, fetchBrands } from '../../features/products/productThunks';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  quickUpdateStock,
} from '../../features/admin/adminProductsThunks';
import { bulkUpdateAdminStock } from '../../features/admin/adminInventoryThunks';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminSearchBar } from '../../components/admin/AdminSearchBar';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const ProductManagement = () => {
  const dispatch = useAppDispatch();
  const { products, pagination, loading } = useAppSelector((state) => state.adminProducts);
  const categories = useAppSelector((state) => state.products.categories.items);
  const brands = useAppSelector((state) => state.products.brands.items);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStockMap, setBulkStockMap] = useState({});

  // Slide-over form state for Full Edit / Create
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Stock Edit State
  const [quickStockValues, setQuickStockValues] = useState({});

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAdminProducts({
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        brand: brandFilter || undefined,
        stockStatus: stockFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, categoryFilter, brandFilter, stockFilter, page]);

  // Handle Quick Stock Edit on blur
  const handleQuickStockBlur = async (productId, currentStock) => {
    const newVal = parseInt(quickStockValues[productId], 10);
    if (isNaN(newVal) || newVal < 0 || newVal === currentStock) return;

    try {
      await dispatch(quickUpdateStock({ id: productId, stock: newVal })).unwrap();
      toast.success('Stock updated');
    } catch (err) {
      toast.error(err || 'Stock update failed');
    }
  };

  const handleOpenSlideOver = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name || '');
      setSku(product.sku || '');
      setCategory(product.category?._id || product.category || '');
      setBrand(product.brand?._id || product.brand || '');
      setPrice(product.price || '');
      setOriginalPrice(product.originalPrice || '');
      setStock(product.stock || 0);
      setDescription(product.description || '');
      setIsFeatured(product.isFeatured || false);
      setIsActive(product.isActive !== undefined ? product.isActive : true);
    } else {
      setEditingProduct(null);
      setName('');
      setSku('');
      setCategory('');
      setBrand('');
      setPrice('');
      setOriginalPrice('');
      setStock('');
      setDescription('');
      setIsFeatured(false);
      setIsActive(true);
    }
    setImageFiles([]);
    setIsSlideOverOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !category) {
      toast.error('Product name, price, and category are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      if (sku) formData.append('sku', sku.trim());
      formData.append('category', category);
      if (brand) formData.append('brand', brand);
      formData.append('price', price);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('stock', stock || 0);
      formData.append('description', description.trim());
      formData.append('isFeatured', isFeatured);
      formData.append('isActive', isActive);

      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
      }

      if (editingProduct) {
        await dispatch(updateAdminProduct({ id: editingProduct._id, formData })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createAdminProduct(formData)).unwrap();
        toast.success('Product created successfully');
      }

      setIsSlideOverOpen(false);
      dispatch(
        fetchAdminProducts({
          search: search.trim() || undefined,
          category: categoryFilter || undefined,
          brand: brandFilter || undefined,
          page,
          limit: 10,
        })
      );
    } catch (err) {
      toast.error(err || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (product) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete product '${product.name}'? This action cannot be undone.`,
      action: async () => {
        try {
          await dispatch(deleteAdminProduct(product._id)).unwrap();
          toast.success('Product deleted successfully');
        } catch (err) {
          toast.error(err || 'Failed to delete product');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Bulk Selection Helpers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleOpenBulkModal = () => {
    const map = {};
    products
      .filter((p) => selectedIds.includes(p._id))
      .forEach((p) => {
        map[p._id] = p.stock;
      });
    setBulkStockMap(map);
    setIsBulkModalOpen(true);
  };

  const handleBulkSubmit = async () => {
    const updates = Object.entries(bulkStockMap).map(([productId, stockVal]) => ({
      productId,
      stock: parseInt(stockVal, 10),
    }));

    try {
      await dispatch(bulkUpdateAdminStock(updates)).unwrap();
      toast.success(`Bulk stock updated for ${updates.length} products`);
      setIsBulkModalOpen(false);
      setSelectedIds([]);
      dispatch(fetchAdminProducts({ page, limit: 10 }));
    } catch (err) {
      toast.error(err || 'Bulk stock update failed');
    }
  };

  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]?.url || 'https://via.placeholder.com/50'}
            alt={p.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {p.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (p) => p.category?.name || 'Uncategorized',
    },
    {
      key: 'price',
      label: 'Price',
      render: (p) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(p.price)}
          </span>
          {p.originalPrice > p.price && (
            <span className="text-[10px] text-slate-400 line-through block">
              {formatCurrency(p.originalPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Quick Stock Edit',
      render: (p) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            defaultValue={p.stock}
            onChange={(e) =>
              setQuickStockValues({ ...quickStockValues, [p._id]: e.target.value })
            }
            onBlur={() => handleQuickStockBlur(p._id, p.stock)}
            className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-primary-500"
          />
          <StatusBadge type="stock" value={p.stock} />
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => <StatusBadge type="active" value={p.isActive} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenSlideOver(p)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
            title="Full Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(p)}
            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
            title="Delete Product"
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
            Product Catalog Management
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage catalog items, pricing, quick stock updates, and bulk inventory edits
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenBulkModal}
              className="px-3.5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5"
            >
              <Boxes size={15} />
              <span>Bulk Stock ({selectedIds.length})</span>
            </button>
          )}
          <button
            onClick={() => handleOpenSlideOver()}
            className="px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-md shadow-primary-600/30 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Admin Search Bar & Filters */}
      <AdminSearchBar
        placeholder="Search products by name or SKU..."
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      >
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent outline-none font-medium"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent outline-none font-medium"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </AdminSearchBar>

      {/* Admin Table */}
      <AdminTable
        columns={columns}
        data={products}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        emptyMessage="No products matching filter criteria found."
      />

      {/* Pagination */}
      <AdminPagination
        currentPage={pagination?.currentPage || 1}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.totalProducts || 0}
        onPageChange={(p) => setPage(p)}
      />

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
      />

      {/* Bulk Stock Update Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title={`Bulk Update Stock (${selectedIds.length} Selected)`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500 font-medium">
            Adjust stock levels for selected items simultaneously:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {products
              .filter((p) => selectedIds.includes(p._id))
              .map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                    {p.name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={bulkStockMap[p._id] ?? p.stock}
                    onChange={(e) =>
                      setBulkStockMap({ ...bulkStockMap, [p._id]: e.target.value })
                    }
                    className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              ))}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkSubmit}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold"
            >
              Submit Bulk Updates
            </button>
          </div>
        </div>
      </Modal>

      {/* Slide-over Form Panel for Full Create / Edit */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl h-full border-l border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                  {editingProduct ? 'Edit Product Catalog Item' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setIsSlideOverOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-mono"
                      placeholder="e.g. SONY-XM5-BLK"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Stock Level *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Brand
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-primary-500 outline-none font-medium"
                    />
                  </div>
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
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Images (Max 8)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-600"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isFeatured" className="font-bold text-slate-700 dark:text-slate-300">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActiveProduct"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isActiveProduct" className="font-bold text-slate-700 dark:text-slate-300">
                      Active on Storefront
                    </label>
                  </div>
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
                    {isSubmitting ? 'Saving...' : 'Save Product'}
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

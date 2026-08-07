import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Edit2,
  Check,
  AlertTriangle,
  Layers,
  Award,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProductsList, fetchCategories, fetchBrands } from '../../features/products/productThunks';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const ProductManagement = () => {
  const dispatch = useAppDispatch();
  const { items: products, pagination, loading } = useAppSelector((state) => state.products.productsList);
  const categories = useAppSelector((state) => state.products.categories.items);
  const brands = useAppSelector((state) => state.products.brands.items);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProductsList({
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        brand: brandFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, categoryFilter, brandFilter, page]);

  const handleStockUpdate = async (productId) => {
    const stockVal = parseInt(stockInput, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      toast.error('Please enter a valid non-negative stock quantity');
      return;
    }

    try {
      setIsUpdatingStock(true);
      await api.patch('/admin/inventory/bulk-update', {
        updates: [{ productId, stock: stockVal }],
      });
      toast.success('Stock updated successfully');
      setEditingStockId(null);
      dispatch(
        fetchProductsList({
          search: search.trim() || undefined,
          category: categoryFilter || undefined,
          brand: brandFilter || undefined,
          page,
          limit: 10,
        })
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock update failed');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage product catalog, inventory stock levels, and search filters
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 text-slate-800 dark:text-slate-100 outline-none transition-all"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 min-w-[150px]">
          <Layers size={15} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by Category"
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-primary-500 outline-none font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-1.5 min-w-[150px]">
          <Award size={15} className="text-slate-400" />
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by Brand"
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-primary-500 outline-none font-medium"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-10 w-48 rounded-xl" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-16 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : products && products.length > 0 ? (
                products.map((prod) => (
                  <tr
                    key={prod._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Product Name & Thumb */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0]?.url || 'https://via.placeholder.com/50'}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{prod.brand?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {prod.sku || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {prod.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(prod.price)}
                    </td>
                    {/* Stock level inline edit */}
                    <td className="p-4">
                      {editingStockId === prod._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={stockInput}
                            onChange={(e) => setStockInput(e.target.value)}
                            className="w-16 px-2 py-1 text-xs rounded-lg border border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleStockUpdate(prod._id)}
                            disabled={isUpdatingStock}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-bold ${
                            prod.stock <= 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : prod.stock <= 5
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      )}
                    </td>
                    {/* Stock status badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          prod.stock <= 0
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : prod.stock <= 10
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {prod.stock <= 0 ? 'Out of Stock' : prod.stock <= 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditingStockId(prod._id);
                          setStockInput(String(prod.stock));
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-primary-600 font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        <span>Edit Stock</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products matching filter criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalProducts} items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

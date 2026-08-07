import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  Minus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminInventory } from '../../features/admin/adminInventoryThunks';
import { quickUpdateStock } from '../../features/admin/adminProductsThunks';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminSearchBar } from '../../components/admin/AdminSearchBar';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const InventoryManagement = () => {
  const dispatch = useAppDispatch();
  const { products, counts, pagination, loading } = useAppSelector((state) => state.adminInventory);

  const [statusFilter, setStatusFilter] = useState(''); // '' | 'in' | 'low' | 'out'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    dispatch(
      fetchAdminInventory({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, statusFilter, search, page]);

  const handleStockStepper = async (productId, currentStock, delta) => {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      await dispatch(quickUpdateStock({ id: productId, stock: nextStock })).unwrap();
      toast.success(`Stock updated to ${nextStock}`);
      dispatch(
        fetchAdminInventory({
          status: statusFilter || undefined,
          search: search.trim() || undefined,
          page,
          limit: 10,
        })
      );
    } catch (err) {
      toast.error('Failed to adjust stock');
    }
  };

  const handleExportLowStockCSV = async () => {
    try {
      setIsExporting(true);
      const res = await api.get('/admin/reports/inventory', {
        params: { format: 'csv' },
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `low_stock_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Inventory report CSV downloaded');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
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
      label: 'Category & Brand',
      render: (p) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">
            {p.category?.name || 'Uncategorized'}
          </span>
          <span className="text-[10px] text-slate-400">{p.brand?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (p) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(p.price)}
        </span>
      ),
    },
    {
      key: 'stockStepper',
      label: 'Stock Adjustment',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStockStepper(p._id, p.stock, -1)}
            disabled={p.stock <= 0}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
            title="Decrease Stock"
          >
            <Minus size={13} />
          </button>
          <span className="w-8 text-center font-black text-xs text-slate-900 dark:text-white">
            {p.stock}
          </span>
          <button
            onClick={() => handleStockStepper(p._id, p.stock, 1)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Increase Stock"
          >
            <Plus size={13} />
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Stock Status',
      render: (p) => <StatusBadge type="stock" value={p.stock} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Inventory & Stock Control
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Monitor stock thresholds, make quick stepper adjustments, and export inventory reports
          </p>
        </div>
        <button
          onClick={handleExportLowStockCSV}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Download size={16} />
          <span>{isExporting ? 'Exporting...' : 'Export Low Stock Report'}</span>
        </button>
      </div>

      {/* 3 Summary Chips Filter Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* In Stock Chip */}
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'in' ? '' : 'in');
            setPage(1);
          }}
          className={`p-4 rounded-3xl text-left border transition-all ${
            statusFilter === 'in'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-100 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              In Stock (&gt;10 units)
            </span>
            <CheckCircle size={18} />
          </div>
          <p className="text-2xl font-black font-outfit">{counts.inStock}</p>
        </button>

        {/* Low Stock Chip */}
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'low' ? '' : 'low');
            setPage(1);
          }}
          className={`p-4 rounded-3xl text-left border transition-all ${
            statusFilter === 'low'
              ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-100 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              Low Stock (1-10 units)
            </span>
            <AlertTriangle size={18} />
          </div>
          <p className="text-2xl font-black font-outfit">{counts.lowStock}</p>
        </button>

        {/* Out of Stock Chip */}
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'out' ? '' : 'out');
            setPage(1);
          }}
          className={`p-4 rounded-3xl text-left border transition-all ${
            statusFilter === 'out'
              ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-100 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              Out of Stock (0 units)
            </span>
            <XCircle size={18} />
          </div>
          <p className="text-2xl font-black font-outfit">{counts.outOfStock}</p>
        </button>
      </div>

      {/* Search Bar */}
      <AdminSearchBar
        placeholder="Search inventory by product name or SKU..."
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      {/* Data Table */}
      <AdminTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No inventory products matching status filter criteria."
      />

      {/* Pagination */}
      <AdminPagination
        currentPage={pagination?.currentPage || 1}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.totalItems || 0}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

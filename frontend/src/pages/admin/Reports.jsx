import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Calendar, DollarSign, Package, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/reports/${activeTab}`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          format: 'json',
        },
      });
      setReportData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, startDate, endDate]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const res = await api.get(`/admin/reports/${activeTab}`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          format: 'csv',
        },
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${activeTab.toUpperCase()} CSV report downloaded successfully`);
    } catch (err) {
      toast.error('Failed to export CSV report');
    } finally {
      setIsExporting(false);
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
            Business Reports & CSV Exports
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Generate and export structured CSV audit logs for Sales, Inventory, and Customer metrics
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={isExporting || loading}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Download size={16} />
          <span>{isExporting ? 'Generating CSV...' : 'Export CSV Report'}</span>
        </button>
      </div>

      {/* Tabs & Date Range Filter */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-wrap items-center justify-between gap-4">
        {/* Report Type Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'sales', label: 'Sales Report', icon: DollarSign },
            { id: 'inventory', label: 'Inventory Valuation', icon: Package },
            { id: 'customers', label: 'Customer Directory', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Date Range Pickers */}
        {activeTab === 'sales' && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-transparent">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-100 outline-none font-medium"
              />
            </div>
            <span className="text-slate-400 font-bold">to</span>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-transparent">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-100 outline-none font-medium"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[10px] font-bold text-rose-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Report Data Preview Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        ) : activeTab === 'sales' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {reportData?.orders && reportData.orders.length > 0 ? (
                  reportData.orders.slice(0, 20).map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {o.orderNumber}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {o.user?.name || 'Guest'}
                      </td>
                      <td className="p-4 uppercase text-[10px] font-black">{o.paymentMethod}</td>
                      <td className="p-4 capitalize font-extrabold text-emerald-600">
                        {o.orderStatus}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(o.totalAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No sales records for selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'inventory' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {reportData?.products && reportData.products.length > 0 ? (
                  reportData.products.slice(0, 20).map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="p-4 font-mono text-slate-500">{p.sku || 'N/A'}</td>
                      <td className="p-4">{p.category?.name || 'Uncategorized'}</td>
                      <td className="p-4 font-bold">{formatCurrency(p.price)}</td>
                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            p.stock <= 0 ? 'text-rose-600' : p.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(p.price * p.stock)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No inventory records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {reportData?.customers && reportData.customers.length > 0 ? (
                  reportData.customers.slice(0, 20).map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="p-4 text-slate-500">{c.email}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold">{c.orderCount}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(c.totalSpent)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No customer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

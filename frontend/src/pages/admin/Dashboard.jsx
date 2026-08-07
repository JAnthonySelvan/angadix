import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchOverview,
  fetchSalesGraph,
  fetchTopProducts,
  fetchInventoryStatus,
  fetchCustomerInsights,
} from '../../features/admin/analyticsThunks';
import { setActivePeriod } from '../../features/admin/analyticsSlice';
import { Skeleton } from '../../components/ui/Skeleton';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  packed: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  returned: '#64748b',
  refunded: '#ec4899',
};

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const {
    overview,
    salesGraph,
    topProducts,
    inventoryStatus,
    customerInsights,
    activePeriod,
    loading,
  } = useAppSelector((state) => state.adminAnalytics);
  const { mode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchSalesGraph(activePeriod));
    dispatch(fetchTopProducts(6));
    dispatch(fetchInventoryStatus());
    dispatch(fetchCustomerInsights());
  }, [dispatch, activePeriod]);

  const handlePeriodChange = (period) => {
    dispatch(setActivePeriod(period));
  };

  const isDarkMode = mode === 'dark';

  // Format currency helper
  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // Pie chart data formatting
  const pieData = overview?.ordersByStatus
    ? Object.entries(overview.ordersByStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color: STATUS_COLORS[status] || '#94a3b8',
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time business intelligence and performance statistics
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-primary-50 dark:bg-slate-800/80 border border-primary-200/60 dark:border-slate-700/60 text-primary-700 dark:text-primary-300 text-xs font-bold self-start sm:self-auto">
          <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
          <span>Live Backend Aggregation</span>
        </div>
      </div>

      {/* Top Row: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-white to-primary-50/40 dark:from-slate-900 dark:to-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          {loading.overview || !overview ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Total Revenue
                </span>
                <div className="w-9 h-9 rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <IndianRupee size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
                  {formatCurrency(overview.totalRevenue)}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      overview.periodComparison?.revenueChangePercent >= 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {overview.periodComparison?.revenueChangePercent >= 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {Math.abs(overview.periodComparison?.revenueChangePercent || 0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    vs last month
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Stat Card 2: Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-white to-primary-50/40 dark:from-slate-900 dark:to-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          {loading.overview || !overview ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Total Orders
                </span>
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
                  {overview.totalOrders.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      overview.periodComparison?.ordersChangePercent >= 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {overview.periodComparison?.ordersChangePercent >= 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {Math.abs(overview.periodComparison?.ordersChangePercent || 0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    vs last month
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Stat Card 3: Customers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-white to-primary-50/40 dark:from-slate-900 dark:to-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          {loading.overview || !overview ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Total Customers
                </span>
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
                  {overview.totalCustomers.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-2">
                  Registered customer accounts
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Stat Card 4: Products & Stock */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-white to-primary-50/40 dark:from-slate-900 dark:to-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          {loading.overview || !overview ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Catalog Products
                </span>
                <div className="w-9 h-9 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <Package size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
                  {overview.totalProducts.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={11} /> {overview.lowStockCount} Low stock
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {overview.outOfStockCount} Out of stock
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Middle Row 1: Sales Time-Series Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
              Revenue & Sales Trend
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Filtered revenue performance over selected time horizon
            </p>
          </div>
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            {['7d', '30d', '12m'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePeriod === period
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-72 w-full">
          {loading.salesGraph || !salesGraph ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-2xl" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesGraph.series}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isDarkMode ? '#38bdf8' : '#0266C8'}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={isDarkMode ? '#38bdf8' : '#0266C8'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700 text-white text-xs shadow-xl">
                          <p className="font-bold text-slate-300 mb-1">{data.date}</p>
                          <p className="font-extrabold text-primary-400">
                            Revenue: {formatCurrency(data.revenue)}
                          </p>
                          <p className="font-semibold text-slate-200">
                            Orders: {data.orders}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={isDarkMode ? '#38bdf8' : '#0266C8'}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Middle Row 2: Top Selling Products + Order Status Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                Top Selling Products
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Highest volume products by total units sold
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {loading.topProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                </div>
              ))
            ) : topProducts.length > 0 ? (
              topProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image || 'https://via.placeholder.com/60'}
                      alt={prod.name}
                      className="w-11 h-11 rounded-xl object-cover bg-white border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        {formatCurrency(prod.price)} each • Stock: {prod.stock ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {prod.totalQuantity} sold
                    </p>
                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(prod.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No top products data yet.</p>
            )}
          </div>
        </motion.div>

        {/* Right Column: Order Status Breakdown (Pie Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
              Order Status Breakdown
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Distribution across order lifecycles
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {loading.overview || !overview ? (
              <Skeleton className="w-40 h-40 rounded-full" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="p-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg">
                            <span>{data.name}: </span>
                            <span className="text-primary-400">{data.value} orders</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No orders recorded yet</p>
            )}
          </div>

          {/* Pie Chart Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-400 font-semibold truncate">
                  {item.name}
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold ml-auto">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Inventory Status Widget + Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                Inventory Stock Distribution
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Stock health breakdown across catalog items
              </p>
            </div>
          </div>

          {loading.inventoryStatus || !inventoryStatus ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* In Stock Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">In Stock (&gt;10 units)</span>
                  <span className="text-slate-900 dark:text-white">
                    {inventoryStatus.counts.inStock} products (
                    {Math.round(
                      (inventoryStatus.counts.inStock / (inventoryStatus.counts.total || 1)) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(inventoryStatus.counts.inStock / (inventoryStatus.counts.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Low Stock Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-600 dark:text-amber-400">Low Stock (1-10 units)</span>
                  <span className="text-slate-900 dark:text-white">
                    {inventoryStatus.counts.lowStock} products (
                    {Math.round(
                      (inventoryStatus.counts.lowStock / (inventoryStatus.counts.total || 1)) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(inventoryStatus.counts.lowStock / (inventoryStatus.counts.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Out of Stock Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Out of Stock (0 units)</span>
                  <span className="text-slate-900 dark:text-white">
                    {inventoryStatus.counts.outOfStock} products (
                    {Math.round(
                      (inventoryStatus.counts.outOfStock / (inventoryStatus.counts.total || 1)) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(inventoryStatus.counts.outOfStock / (inventoryStatus.counts.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Customer Insights Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                Customer Acquisition & Retention
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Monthly growth & repeat customer activity
              </p>
            </div>
          </div>

          {loading.customerInsights || !customerInsights ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
                  <UserCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    New Customers
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-outfit">
                  {customerInsights.newCustomersThisMonth}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  vs {customerInsights.newCustomersLastMonth} last month
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Repeat Customer Rate
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-outfit">
                  {customerInsights.repeatCustomerRate}%
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  {customerInsights.repeatCustomersCount} of {customerInsights.totalOrderingCustomers} buyers
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

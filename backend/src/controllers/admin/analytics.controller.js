import { User } from '../../models/User.js';
import { Product } from '../../models/Product.js';
import { Order } from '../../models/Order.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * @desc    Get dashboard analytics overview (Revenue, Orders breakdown, Customers, Products, PoP change)
 * @route   GET /api/v1/admin/analytics/overview
 * @access  Private/Admin
 */
export const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Revenue filter: paid OR cod AND orderStatus != cancelled
  const validRevenueMatch = {
    $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'cod' }],
    orderStatus: { $ne: 'cancelled' },
  };

  const [
    revenueAgg,
    ordersBreakdownAgg,
    totalCustomers,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    thisMonthAgg,
    lastMonthAgg,
  ] = await Promise.all([
    // Total Revenue
    Order.aggregate([
      { $match: validRevenueMatch },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } },
    ]),
    // Orders count by status
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    // Total customers
    User.countDocuments({ role: 'user' }),
    // Total products
    Product.countDocuments({}),
    // Low stock count (stock between 1 and 5)
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    // Out of stock count
    Product.countDocuments({ stock: { $lte: 0 } }),
    // This month metrics
    Order.aggregate([
      {
        $match: {
          ...validRevenueMatch,
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]),
    // Last month metrics
    Order.aggregate([
      {
        $match: {
          ...validRevenueMatch,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const totalOrders = ordersBreakdownAgg.reduce((acc, curr) => acc + curr.count, 0);

  // Status breakdown dictionary
  const ordersByStatus = {
    pending: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    refunded: 0,
  };
  ordersBreakdownAgg.forEach((item) => {
    if (ordersByStatus[item._id] !== undefined) {
      ordersByStatus[item._id] = item.count;
    }
  });

  const thisMonthRev = thisMonthAgg[0]?.revenue || 0;
  const thisMonthOrders = thisMonthAgg[0]?.orders || 0;
  const lastMonthRev = lastMonthAgg[0]?.revenue || 0;
  const lastMonthOrders = lastMonthAgg[0]?.orders || 0;

  const revenueChangePercent =
    lastMonthRev === 0
      ? thisMonthRev > 0 ? 100 : 0
      : Number((((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1));

  const ordersChangePercent =
    lastMonthOrders === 0
      ? thisMonthOrders > 0 ? 100 : 0
      : Number((((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        ordersByStatus,
        periodComparison: {
          thisMonth: { revenue: thisMonthRev, orders: thisMonthOrders },
          lastMonth: { revenue: lastMonthRev, orders: lastMonthOrders },
          revenueChangePercent,
          ordersChangePercent,
        },
      },
      'Overview analytics fetched successfully.'
    )
  );
});

/**
 * @desc    Get sales time series graph (7d, 30d, 12m)
 * @route   GET /api/v1/admin/analytics/sales-graph
 * @access  Private/Admin
 */
export const getSalesGraph = asyncHandler(async (req, res) => {
  const period = req.query.period || '7d';
  const now = new Date();
  let startDate = new Date();
  let dateFormat = '%Y-%m-%d';
  const dataPoints = [];

  if (period === '12m') {
    dateFormat = '%Y-%m';
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    // Generate 12 months array
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      dataPoints.push({ date: `${year}-${month}`, label: d.toLocaleString('en-US', { month: 'short' }) });
    }
  } else if (period === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      dataPoints.push({ date: dateStr, label: d.toLocaleString('en-US', { month: 'short', day: 'numeric' }) });
    }
  } else {
    // Default 7d
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      dataPoints.push({ date: dateStr, label: d.toLocaleString('en-US', { weekday: 'short' }) });
    }
  }

  const rawAggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'cod' }],
        orderStatus: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
  ]);

  const aggMap = new Map();
  rawAggregation.forEach((item) => {
    aggMap.set(item._id, { revenue: item.revenue, orders: item.orders });
  });

  const series = dataPoints.map((dp) => {
    const agg = aggMap.get(dp.date) || { revenue: 0, orders: 0 };
    return {
      date: dp.date,
      label: dp.label,
      revenue: agg.revenue,
      orders: agg.orders,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, { period, series }, 'Sales graph time series fetched successfully.')
  );
});

/**
 * @desc    Get top selling products
 * @route   GET /api/v1/admin/analytics/top-products
 * @access  Private/Admin
 */
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '10', 10);

  const topProducts = await Order.aggregate([
    {
      $match: {
        $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'cod' }],
        orderStatus: { $ne: 'cancelled' },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        price: { $first: '$items.price' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDoc',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        price: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        slug: { $arrayElemAt: ['$productDoc.slug', 0] },
        stock: { $arrayElemAt: ['$productDoc.stock', 0] },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, topProducts, 'Top products fetched successfully.')
  );
});

/**
 * @desc    Get inventory status (in-stock, low-stock, out-of-stock counts & product lists)
 * @route   GET /api/v1/admin/analytics/inventory-status
 * @access  Private/Admin
 */
export const getInventoryStatus = asyncHandler(async (req, res) => {
  const [inStockCount, lowStockCount, outOfStockCount, lowStockProducts, outOfStockProducts] =
    await Promise.all([
      Product.countDocuments({ stock: { $gt: 10 } }),
      Product.countDocuments({ stock: { $gte: 1, $lte: 10 } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Product.find({ stock: { $gte: 1, $lte: 10 } })
        .select('_id name sku stock price images category')
        .populate('category', 'name')
        .limit(50)
        .lean(),
      Product.find({ stock: { $lte: 0 } })
        .select('_id name sku stock price images category')
        .populate('category', 'name')
        .limit(50)
        .lean(),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        counts: {
          inStock: inStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          total: inStockCount + lowStockCount + outOfStockCount,
        },
        lowStockProducts,
        outOfStockProducts,
      },
      'Inventory status fetched successfully.'
    )
  );
});

/**
 * @desc    Get customer analytics & lifetime top spenders
 * @route   GET /api/v1/admin/analytics/customer-insights
 * @access  Private/Admin
 */
export const getCustomerInsights = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [newCustomersThisMonth, newCustomersLastMonth, userOrderCounts, topCustomers] =
    await Promise.all([
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Order.aggregate([
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'cod' }],
            orderStatus: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: '$user',
            totalSpend: { $sum: '$totalAmount' },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            avatar: '$user.avatar',
            ordersCount: 1,
            totalSpend: 1,
            createdAt: '$user.createdAt',
          },
        },
      ]),
    ]);

  const totalOrderingCustomers = userOrderCounts.length;
  const repeatCustomersCount = userOrderCounts.filter((item) => item.orderCount > 1).length;
  const repeatCustomerRate =
    totalOrderingCustomers === 0
      ? 0
      : Number(((repeatCustomersCount / totalOrderingCustomers) * 100).toFixed(1));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        newCustomersThisMonth,
        newCustomersLastMonth,
        repeatCustomerRate,
        repeatCustomersCount,
        totalOrderingCustomers,
        topCustomers,
      },
      'Customer insights fetched successfully.'
    )
  );
});

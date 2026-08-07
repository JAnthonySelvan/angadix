import { Order } from '../../models/Order.js';
import { Product } from '../../models/Product.js';
import { User } from '../../models/User.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const buildCSV = (rows, fields) => {
  const header = fields.map((f) => `"${f.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) =>
    fields
      .map((f) => {
        let val = f.getter ? f.getter(row) : row[f.key];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );
  return [header, ...lines].join('\r\n');
};

/**
 * @desc    Generate Sales Report (JSON or CSV)
 * @route   GET /api/v1/admin/reports/sales
 * @access  Private/Admin
 */
export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;

  const matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  const orders = await Order.find(matchQuery)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  if (format === 'csv') {
    const fields = [
      { label: 'Order Number', key: 'orderNumber' },
      { label: 'Date', getter: (r) => (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '') },
      { label: 'Customer Name', getter: (r) => r.user?.name || 'Guest' },
      { label: 'Customer Email', getter: (r) => r.user?.email || 'N/A' },
      { label: 'Payment Method', key: 'paymentMethod' },
      { label: 'Payment Status', key: 'paymentStatus' },
      { label: 'Order Status', key: 'orderStatus' },
      { label: 'Subtotal (₹)', key: 'subtotal' },
      { label: 'Discount (₹)', key: 'discountAmount' },
      { label: 'Shipping (₹)', key: 'shippingCharge' },
      { label: 'Tax (₹)', key: 'taxAmount' },
      { label: 'Total Amount (₹)', key: 'totalAmount' },
      { label: 'Items Count', getter: (r) => r.items?.length || 0 },
    ];

    const csvContent = buildCSV(orders, fields);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales_report_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return res.status(200).json(
    new ApiResponse(200, { totalOrders: orders.length, orders }, 'Sales report generated successfully.')
  );
});

/**
 * @desc    Generate Inventory Report (JSON or CSV)
 * @route   GET /api/v1/admin/reports/inventory
 * @access  Private/Admin
 */
export const getInventoryReport = asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  const products = await Product.find({})
    .populate('category', 'name')
    .populate('brand', 'name')
    .sort({ stock: 1, name: 1 })
    .lean();

  if (format === 'csv') {
    const fields = [
      { label: 'Product Name', key: 'name' },
      { label: 'SKU', key: 'sku' },
      { label: 'Category', getter: (r) => r.category?.name || 'Uncategorized' },
      { label: 'Brand', getter: (r) => r.brand?.name || 'N/A' },
      { label: 'Price (₹)', key: 'price' },
      { label: 'Original Price (₹)', key: 'originalPrice' },
      { label: 'Stock Level', key: 'stock' },
      {
        label: 'Stock Status',
        getter: (r) => (r.stock <= 0 ? 'Out of Stock' : r.stock <= 10 ? 'Low Stock' : 'In Stock'),
      },
      { label: 'Is Active', getter: (r) => (r.isActive ? 'Yes' : 'No') },
      { label: 'Total Stock Valuation (₹)', getter: (r) => (r.price * r.stock).toFixed(2) },
    ];

    const csvContent = buildCSV(products, fields);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory_report_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return res.status(200).json(
    new ApiResponse(200, { totalProducts: products.length, products }, 'Inventory report generated successfully.')
  );
});

/**
 * @desc    Generate Customer Report (JSON or CSV)
 * @route   GET /api/v1/admin/reports/customers
 * @access  Private/Admin
 */
export const getCustomerReport = asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  const users = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .lean();

  // Aggregate user order summary
  const orderSummaries = await Order.aggregate([
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $or: [{ $eq: ['$paymentStatus', 'paid'] }, { $eq: ['$paymentMethod', 'cod'] }] },
                  { $ne: ['$orderStatus', 'cancelled'] },
                ],
              },
              '$totalAmount',
              0,
            ],
          },
        },
        lastOrderDate: { $max: '$createdAt' },
      },
    },
  ]);

  const summaryMap = new Map();
  orderSummaries.forEach((s) => summaryMap.set(s._id.toString(), s));

  const customerData = users.map((u) => {
    const summary = summaryMap.get(u._id.toString()) || { orderCount: 0, totalSpent: 0, lastOrderDate: null };
    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      isBlocked: u.isBlocked || false,
      createdAt: u.createdAt,
      orderCount: summary.orderCount,
      totalSpent: summary.totalSpent,
      lastOrderDate: summary.lastOrderDate,
    };
  });

  if (format === 'csv') {
    const fields = [
      { label: 'Customer Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Status', getter: (r) => (r.isBlocked ? 'Blocked' : 'Active') },
      { label: 'Joined Date', getter: (r) => (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '') },
      { label: 'Total Orders', key: 'orderCount' },
      { label: 'Lifetime Spend (₹)', getter: (r) => r.totalSpent.toFixed(2) },
      { label: 'Last Order Date', getter: (r) => (r.lastOrderDate ? new Date(r.lastOrderDate).toISOString().slice(0, 10) : 'Never') },
    ];

    const csvContent = buildCSV(customerData, fields);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customer_report_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return res.status(200).json(
    new ApiResponse(200, { totalCustomers: customerData.length, customers: customerData }, 'Customer report generated successfully.')
  );
});

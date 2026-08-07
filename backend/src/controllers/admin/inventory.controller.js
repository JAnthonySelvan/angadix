import { Product } from '../../models/Product.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * @desc    Get paginated inventory products with status filter (low, out, in)
 * @route   GET /api/v1/admin/inventory
 * @access  Private/Admin
 */
export const getInventoryProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const { status, search } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};

  if (status === 'out') {
    filter.stock = { $lte: 0 };
  } else if (status === 'low') {
    filter.stock = { $gte: 1, $lte: 10 };
  } else if (status === 'in') {
    filter.stock = { $gt: 10 };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const [products, totalItems, inStockCount, lowStockCount, outOfStockCount] =
    await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort({ stock: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      Product.countDocuments({ stock: { $gt: 10 } }),
      Product.countDocuments({ stock: { $gte: 1, $lte: 10 } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        counts: {
          inStock: inStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          total: inStockCount + lowStockCount + outOfStockCount,
        },
        pagination: {
          totalItems,
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          limit,
        },
      },
      'Inventory products retrieved successfully.'
    )
  );
});

/**
 * @desc    Get low stock alerts (legacy route wrapper)
 * @route   GET /api/v1/admin/inventory/low-stock-alerts
 * @access  Private/Admin
 */
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  req.query.status = 'low';
  return getInventoryProducts(req, res);
});

/**
 * @desc    Bulk update inventory stock levels with partial failure tracking
 * @route   PATCH /api/v1/admin/inventory/bulk-update
 * @access  Private/Admin
 */
export const bulkUpdateStock = asyncHandler(async (req, res) => {
  const updates = req.body.updates || req.body; // Accept { updates: [...] } or array directly

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Updates payload must be a non-empty array of { productId, stock }.');
  }

  const validOps = [];
  const failed = [];

  for (const item of updates) {
    const productId = item.productId || item.id || item._id;
    const stock = parseInt(item.stock, 10);

    if (!productId || isNaN(stock) || stock < 0) {
      failed.push({ productId, reason: 'Invalid product ID or negative stock value' });
    } else {
      validOps.push({
        updateOne: {
          filter: { _id: productId },
          update: { $set: { stock } },
        },
      });
    }
  }

  let updatedCount = 0;
  if (validOps.length > 0) {
    const result = await Product.bulkWrite(validOps);
    updatedCount = result.modifiedCount || result.matchedCount || 0;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        updated: updatedCount,
        failed,
      },
      `Bulk stock update processed. ${updatedCount} products updated.`
    )
  );
});

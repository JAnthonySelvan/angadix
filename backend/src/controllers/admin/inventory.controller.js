import { Product } from '../../models/Product.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * @desc    Get low stock alerts (paginated products with stock <= threshold)
 * @route   GET /api/v1/admin/inventory/low-stock-alerts
 * @access  Private/Admin
 */
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const threshold = parseInt(req.query.threshold || '10', 10);
  const skip = (page - 1) * limit;

  const filter = { stock: { $lte: threshold } };

  const [products, totalItems] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ stock: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalItems,
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          limit,
        },
      },
      'Low stock alerts fetched successfully.'
    )
  );
});

/**
 * @desc    Bulk update inventory stock levels
 * @route   PATCH /api/v1/admin/inventory/bulk-update
 * @access  Private/Admin
 */
export const bulkUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Expect array of { productId, stock }

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Updates payload must be a non-empty array of { productId, stock }.');
  }

  const bulkOps = updates.map(({ productId, stock }) => {
    if (!productId || stock === undefined || stock < 0) {
      throw new ApiError(400, `Invalid stock update object for product ID '${productId}'. Stock must be >= 0.`);
    }

    return {
      updateOne: {
        filter: { _id: productId },
        update: { $set: { stock: parseInt(stock, 10) } },
      },
    };
  });

  const result = await Product.bulkWrite(bulkOps);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      `Bulk stock update completed. ${result.modifiedCount} products updated.`
    )
  );
});

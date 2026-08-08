import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

/**
 * Recalculate ratingsAverage and ratingsCount on Product document
 */
const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    const ratingsCount = stats[0].count;
    const ratingsAverage = Math.round(stats[0].avgRating * 10) / 10;
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage,
      ratingsCount,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsCount: 0,
    });
  }
};

/**
 * @desc Get paginated reviews for a product
 * @route GET /api/v1/reviews/product/:productId
 * @access Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || 'newest';

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'highest') {
    sortOption = { rating: -1, createdAt: -1 };
  } else if (sort === 'lowest') {
    sortOption = { rating: 1, createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: productId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
      },
      'Product reviews fetched successfully'
    )
  );
});

/**
 * @desc Get rating summary and distribution for a product
 * @route GET /api/v1/reviews/product/:productId/summary
 * @access Public
 */
export const getProductReviewSummary = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const distributionRaw = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalCount = 0;
  let totalRatingSum = 0;

  distributionRaw.forEach((item) => {
    distribution[item._id] = item.count;
    totalCount += item.count;
    totalRatingSum += item._id * item.count;
  });

  const average = totalCount > 0 ? Math.round((totalRatingSum / totalCount) * 10) / 10 : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        average,
        count: totalCount,
        distribution,
      },
      'Review summary fetched successfully'
    )
  );
});

/**
 * @desc Create a new review for a product
 * @route POST /api/v1/reviews/product/:productId
 * @access Private (User)
 */
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment, images } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this product');
  }

  // Check verified purchase (delivered order containing this product)
  const deliveredOrder = await Order.findOne({
    user: userId,
    orderStatus: 'delivered',
    'items.product': productId,
  });

  const isVerifiedPurchase = Boolean(deliveredOrder);

  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase,
  });

  await updateProductRatingStats(product._id);

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  return res.status(201).json(
    new ApiResponse(201, { review: populatedReview }, 'Review submitted successfully')
  );
});

/**
 * @desc Update user's review
 * @route PUT /api/v1/reviews/:reviewId
 * @access Private (Owner)
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment, images } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this review');
  }

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;

  await review.save();
  await updateProductRatingStats(review.product);

  const updatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  return res.status(200).json(
    new ApiResponse(200, { review: updatedReview }, 'Review updated successfully')
  );
});

/**
 * @desc Delete review
 * @route DELETE /api/v1/reviews/:reviewId
 * @access Private (Owner or Admin)
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const isOwner = review.user.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRatingStats(productId);

  return res.status(200).json(
    new ApiResponse(200, { reviewId }, 'Review deleted successfully')
  );
});

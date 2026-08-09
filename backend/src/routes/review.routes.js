import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getProductReviews,
  getProductReviewSummary,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createReviewValidator,
  updateReviewValidator,
} from '../validators/review.validator.js';

const router = express.Router();

// Rate limiter for review creation to prevent spam
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 reviews per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many reviews posted from this IP. Please try again after 15 minutes.',
    errors: [],
  },
});

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/summary', getProductReviewSummary);

// Protected routes
router.post(
  '/product/:productId',
  protect,
  reviewLimiter,
  validate(createReviewValidator),
  createReview
);

router.put(
  '/:reviewId',
  protect,
  validate(updateReviewValidator),
  updateReview
);

router.delete('/:reviewId', protect, deleteReview);

export default router;

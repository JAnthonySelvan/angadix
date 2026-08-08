import express from 'express';
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

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/summary', getProductReviewSummary);

// Protected routes
router.post(
  '/product/:productId',
  protect,
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

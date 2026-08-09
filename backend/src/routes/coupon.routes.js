import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCouponValidator,
  updateCouponValidator,
  getCouponsQueryValidator,
  getCouponByIdValidator,
  validateCouponValidator,
} from '../validators/coupon.validator.js';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deactivateCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';

const router = Router();

// Rate Limiter to prevent brute-force coupon validation attempts
const couponValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 attempts per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many coupon validation attempts. Please try again after 15 minutes.',
    errors: [],
  },
});

// 1. User Coupon Preview Validation Endpoint (requires authentication for per-user limit check)
router.post('/validate', protect, couponValidateLimiter, validate(validateCouponValidator), validateCoupon);

// 2. Admin-only Coupon Management Endpoints
router.use(protect, authorize('admin'));

router.route('/')
  .post(validate(createCouponValidator), createCoupon)
  .get(validate(getCouponsQueryValidator), getAllCoupons);

router.route('/:id')
  .get(validate(getCouponByIdValidator), getCouponById)
  .patch(validate(updateCouponValidator), updateCoupon)
  .delete(validate(getCouponByIdValidator), deactivateCoupon);

export default router;

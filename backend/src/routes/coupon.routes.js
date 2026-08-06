import { Router } from 'express';
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

// 1. User Coupon Preview Validation Endpoint (requires authentication for per-user limit check)
router.post('/validate', protect, validate(validateCouponValidator), validateCoupon);

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

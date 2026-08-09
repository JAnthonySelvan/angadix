import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderValidator,
  verifyPaymentValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  getOrdersQueryValidator,
} from '../validators/order.validator.js';
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderTimeline,
} from '../controllers/order.controller.js';

const router = Router();

// Checkout & Payment Rate Limiter
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 checkout attempts per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many checkout attempts. Please try again after 15 minutes.',
    errors: [],
  },
});

// Razorpay Webhook (must use raw body parsing)
router.post(
  '/webhook/razorpay',
  razorpayWebhook
);

// Protected routes (User / Authenticated)
router.use(protect);

router
  .route('/')
  .post(checkoutLimiter, validate(createOrderValidator), createOrder)
  .get(authorize('admin'), validate(getOrdersQueryValidator), getAllOrders);

router.post(
  '/verify-payment',
  checkoutLimiter,
  validate(verifyPaymentValidator),
  verifyPayment
);

router.get('/my-orders', getMyOrders);

router.get('/:id', getOrderById);

router.get('/:id/timeline', getOrderTimeline);

router.patch('/:id/cancel', validate(cancelOrderValidator), cancelOrder);

// Admin-only order status transition route
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateOrderStatusValidator),
  updateOrderStatus
);

export default router;

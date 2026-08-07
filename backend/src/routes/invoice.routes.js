import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { regenerateInvoiceValidator } from '../validators/order.validator.js';
import { downloadInvoice, regenerateInvoice } from '../controllers/invoice.controller.js';

const router = Router({ mergeParams: true });

// Rate Limiter for PDF generation (CPU-bound)
const invoiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // 30 requests per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many invoice download requests. Please try again after 15 minutes.',
    errors: [],
  },
});

// Protected route: owner or admin can download/stream PDF invoice
router.get('/:id/invoice', protect, invoiceLimiter, downloadInvoice);

// Admin-only route: force regenerate invoice PDF & update Cloudinary cache
router.post(
  '/:id/invoice/regenerate',
  protect,
  authorize('admin'),
  validate(regenerateInvoiceValidator),
  regenerateInvoice
);

export default router;

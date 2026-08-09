import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const createOrderValidator = [
  body('shippingAddressId')
    .notEmpty()
    .withMessage('Shipping address ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid shipping address ID format');
      }
      return true;
    }),

  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['razorpay', 'cod'])
    .withMessage("Payment method must be either 'razorpay' or 'cod'"),
];

export const verifyPaymentValidator = [
  body('razorpay_order_id')
    .trim()
    .notEmpty()
    .withMessage('razorpay_order_id is required'),

  body('razorpay_payment_id')
    .trim()
    .notEmpty()
    .withMessage('razorpay_payment_id is required'),

  body('razorpay_signature')
    .trim()
    .notEmpty()
    .withMessage('razorpay_signature is required'),

  body('orderId')
    .notEmpty()
    .withMessage('orderId is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid orderId format');
      }
      return true;
    }),
];

export const updateOrderStatusValidator = [
  body('orderStatus')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn([
      'pending',
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
      'refunded',
    ])
    .withMessage('Invalid order status value'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),

  body('carrier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Carrier name cannot exceed 100 characters'),

  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number cannot exceed 100 characters')
    .custom((value, { req }) => {
      if (req.body.orderStatus === 'shipped') {
        // carrier or trackingNumber can be provided when shipping
        return true;
      }
      return true;
    }),
];

export const cancelOrderValidator = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

export const regenerateInvoiceValidator = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid order ID format');
      }
      return true;
    }),
];

export const getOrdersQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50'),
  query('orderStatus')
    .optional()
    .isIn([
      'pending',
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
      'refunded',
    ])
    .withMessage('Invalid order status filter'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date string'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date string'),
];

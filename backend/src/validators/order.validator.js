import { body } from 'express-validator';
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
];

export const cancelOrderValidator = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

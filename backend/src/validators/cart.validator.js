import { body, param } from 'express-validator';
import mongoose from 'mongoose';

export const addToCartValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID format');
      }
      return true;
    }),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer of at least 1'),
];

export const updateCartItemValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer of at least 1'),
];

export const removeFromCartValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
];

export const applyCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),
];

export const mergeCartValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Item product ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid item product ID format');
      }
      return true;
    }),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Item quantity must be an integer of at least 1'),
];

import { body, param } from 'express-validator';
import mongoose from 'mongoose';

export const addToWishlistValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID format');
      }
      return true;
    }),
];

export const removeFromWishlistValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
];

export const moveToCartValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
];

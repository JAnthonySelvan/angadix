import { param } from 'express-validator';
import mongoose from 'mongoose';

export const moveToSavedForLaterValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
];

export const moveSavedToCartValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
];

export const removeFromSavedForLaterValidator = [
  param('productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid product ID format');
    }
    return true;
  }),
];

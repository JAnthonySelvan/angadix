import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const createBannerValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Banner title is required')
    .isLength({ max: 150 })
    .withMessage('Banner title cannot exceed 150 characters'),

  body('placement')
    .optional()
    .isIn(['hero', 'promo', 'category', 'flash-sale'])
    .withMessage("Placement must be 'hero', 'promo', 'category', or 'flash-sale'"),

  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateBannerValidator = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid banner ID format');
    }
    return true;
  }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Banner title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Banner title cannot exceed 150 characters'),

  body('placement')
    .optional()
    .isIn(['hero', 'promo', 'category', 'flash-sale'])
    .withMessage("Placement must be 'hero', 'promo', 'category', or 'flash-sale'"),
];

export const reorderBannersValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),
  body('items.*.id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid banner ID format: ${value}`);
    }
    return true;
  }),
  body('items.*.sortOrder')
    .isInt()
    .withMessage('sortOrder must be an integer'),
];

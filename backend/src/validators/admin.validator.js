import { query, param, body } from 'express-validator';
import mongoose from 'mongoose';

export const salesGraphQueryValidator = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '12m'])
    .withMessage("Period must be one of '7d', '30d', or '12m'"),
];

export const topProductsQueryValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
];

export const reportQueryValidator = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage("Format must be either 'json' or 'csv'"),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date string'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date string'),
];

export const createBannerValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Banner title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('placement')
    .optional()
    .isIn(['hero', 'promo', 'category', 'flash-sale'])
    .withMessage("Placement must be 'hero', 'promo', 'category', or 'flash-sale'"),
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
    .withMessage('Title cannot exceed 150 characters'),
  body('placement')
    .optional()
    .isIn(['hero', 'promo', 'category', 'flash-sale'])
    .withMessage("Placement must be 'hero', 'promo', 'category', or 'flash-sale'"),
];

export const bulkUpdateStockValidator = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('updates must be a non-empty array'),
  body('updates.*.productId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid product ID format in updates array: ${value}`);
    }
    return true;
  }),
  body('updates.*.stock')
    .isInt({ min: 0 })
    .withMessage('stock must be a non-negative integer'),
];

export const mongoIdParamValidator = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid ID format');
    }
    return true;
  }),
];

import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const createCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Coupon code must be between 2 and 30 characters long')
    .toUpperCase(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('discountType')
    .notEmpty()
    .withMessage('Discount type is required')
    .isIn(['percentage', 'flat'])
    .withMessage('Discount type must be either percentage or flat'),

  body('discountValue')
    .notEmpty()
    .withMessage('Discount value is required')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a non-negative number')
    .custom((value, { req }) => {
      if (req.body.discountType === 'percentage') {
        const val = parseFloat(value);
        if (isNaN(val) || val < 0 || val > 100) {
          throw new Error('Percentage discount value must be between 0 and 100');
        }
      }
      return true;
    }),

  body('maxDiscountAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Max discount amount must be a non-negative number'),

  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a non-negative number'),

  body('usageLimit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Usage limit must be an integer of at least 1'),

  body('usageLimitPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit per user must be an integer of at least 1'),

  body('validFrom')
    .notEmpty()
    .withMessage('Valid from date is required')
    .isISO8601()
    .withMessage('Valid from date must be a valid ISO 8601 date string'),

  body('validUntil')
    .notEmpty()
    .withMessage('Valid until date is required')
    .isISO8601()
    .withMessage('Valid until date must be a valid ISO 8601 date string')
    .custom((value, { req }) => {
      if (req.body.validFrom && value) {
        const from = new Date(req.body.validFrom);
        const until = new Date(value);
        if (until <= from) {
          throw new Error('Valid until date must be strictly after valid from date');
        }
      }
      return true;
    }),

  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array')
    .custom((categories) => {
      if (Array.isArray(categories)) {
        for (const catId of categories) {
          if (!mongoose.Types.ObjectId.isValid(catId)) {
            throw new Error(`Invalid category ID format in applicableCategories: ${catId}`);
          }
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateCouponValidator = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid coupon ID format');
    }
    return true;
  }),

  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Coupon code cannot be empty')
    .isLength({ min: 2, max: 30 })
    .withMessage('Coupon code must be between 2 and 30 characters long')
    .toUpperCase(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('discountType')
    .optional()
    .isIn(['percentage', 'flat'])
    .withMessage('Discount type must be either percentage or flat'),

  body('discountValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a non-negative number')
    .custom((value, { req }) => {
      const type = req.body.discountType;
      if (type === 'percentage') {
        const val = parseFloat(value);
        if (isNaN(val) || val < 0 || val > 100) {
          throw new Error('Percentage discount value must be between 0 and 100');
        }
      }
      return true;
    }),

  body('maxDiscountAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Max discount amount must be a non-negative number'),

  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a non-negative number'),

  body('usageLimit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Usage limit must be an integer of at least 1'),

  body('usageLimitPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit per user must be an integer of at least 1'),

  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid from date must be a valid ISO 8601 date string'),

  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be a valid ISO 8601 date string')
    .custom((value, { req }) => {
      if (req.body.validFrom && value) {
        const from = new Date(req.body.validFrom);
        const until = new Date(value);
        if (until <= from) {
          throw new Error('Valid until date must be strictly after valid from date');
        }
      }
      return true;
    }),

  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array')
    .custom((categories) => {
      if (Array.isArray(categories)) {
        for (const catId of categories) {
          if (!mongoose.Types.ObjectId.isValid(catId)) {
            throw new Error(`Invalid category ID format in applicableCategories: ${catId}`);
          }
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const getCouponsQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('code')
    .optional()
    .trim(),
];

export const getCouponByIdValidator = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid coupon ID format');
    }
    return true;
  }),
];

export const validateCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),
  body('orderValue')
    .notEmpty()
    .withMessage('Order value is required')
    .isFloat({ min: 0 })
    .withMessage('Order value must be a non-negative number'),
];

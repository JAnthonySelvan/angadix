import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters long'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid category ID format');
      }
      return true;
    }),

  body('brand')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid brand ID format');
      }
      return true;
    }),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('discountPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number')
    .custom((value, { req }) => {
      if (value !== undefined && value !== null && value !== '') {
        const price = parseFloat(req.body.price);
        const discount = parseFloat(value);
        if (!isNaN(price) && discount >= price) {
          throw new Error('Discount price must be strictly less than the original price');
        }
      }
      return true;
    }),

  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  body('isBestSeller')
    .optional()
    .isBoolean()
    .withMessage('isBestSeller must be a boolean'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateProductValidator = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID format');
      }
      return true;
    }),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters long'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product description cannot be empty'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),

  body('category')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid category ID format');
      }
      return true;
    }),

  body('brand')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid brand ID format');
      }
      return true;
    }),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('discountPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number')
    .custom((value, { req }) => {
      if (value !== undefined && value !== null && value !== '' && req.body.price) {
        const price = parseFloat(req.body.price);
        const discount = parseFloat(value);
        if (!isNaN(price) && discount >= price) {
          throw new Error('Discount price must be strictly less than the original price');
        }
      }
      return true;
    }),

  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  body('isBestSeller')
    .optional()
    .isBoolean()
    .withMessage('isBestSeller must be a boolean'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateStockValidator = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID format');
      }
      return true;
    }),

  body('stock')
    .notEmpty()
    .withMessage('Stock value is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

export const searchProductsValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query (q) is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a positive number')
    .custom((value, { req }) => {
      if (value !== undefined && req.query.minPrice !== undefined) {
        if (parseFloat(value) < parseFloat(req.query.minPrice)) {
          throw new Error('maxPrice must be greater than or equal to minPrice');
        }
      }
      return true;
    }),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('minRating must be between 0 and 5'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

export const searchSuggestionsValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query (q) is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
];

export const getProductsQueryValidator = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a positive number')
    .custom((value, { req }) => {
      if (value !== undefined && req.query.minPrice !== undefined) {
        if (parseFloat(value) < parseFloat(req.query.minPrice)) {
          throw new Error('maxPrice must be greater than or equal to minPrice');
        }
      }
      return true;
    }),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('minRating must be between 0 and 5'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];


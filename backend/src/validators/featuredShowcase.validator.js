import { body, param } from 'express-validator';
import mongoose from 'mongoose';

export const createFeaturedShowcaseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Showcase title is required')
    .isLength({ max: 150 })
    .withMessage('Showcase title cannot exceed 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Showcase description is required')
    .isLength({ max: 500 })
    .withMessage('Showcase description cannot exceed 500 characters'),

  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateFeaturedShowcaseValidator = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid featured showcase ID format');
    }
    return true;
  }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Showcase title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Showcase title cannot exceed 150 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Showcase description cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Showcase description cannot exceed 500 characters'),
];

export const reorderFeaturedShowcaseValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),
  body('items.*.id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid featured showcase ID format: ${value}`);
    }
    return true;
  }),
  body('items.*.sortOrder')
    .isInt()
    .withMessage('sortOrder must be an integer'),
];

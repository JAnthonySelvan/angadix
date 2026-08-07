import { body } from 'express-validator';

export const createAddressValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number'),

  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address Line 1 is required'),

  body('addressLine2')
    .optional()
    .trim(),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .matches(/^\d{6}$/)
    .withMessage('Postal code must be a 6-digit number'),

  body('country')
    .optional()
    .trim(),

  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),
];

export const updateAddressValidator = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number'),

  body('addressLine1')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address Line 1 cannot be empty'),

  body('addressLine2')
    .optional()
    .trim(),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),

  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),

  body('postalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Postal code cannot be empty')
    .matches(/^\d{6}$/)
    .withMessage('Postal code must be a 6-digit number'),

  body('country')
    .optional()
    .trim(),

  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),
];

import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware runner for express-validator validation rules.
 * If validation errors exist, throws a 422 Unprocessable Entity ApiError with field-level details.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules sequentially
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(
      new ApiError(
        422,
        'Validation failed for one or more fields.',
        formattedErrors
      )
    );
  };
};

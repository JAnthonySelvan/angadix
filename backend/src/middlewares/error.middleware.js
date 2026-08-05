import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Global Express Error Middleware
 */
// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, wrap it into an ApiError
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || 'Internal Server Error';
    let errors = [];

    // Mongoose Duplicate Key Error (E11000)
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue)[0];
      message = `An account or record with that ${field} already exists.`;
      errors = [{ field, message: `${field} must be unique.` }];
    }

    // Mongoose Validation Error
    if (error.name === 'ValidationError') {
      statusCode = 422;
      message = 'Database validation failed.';
      errors = Object.values(error.errors).map((val) => ({
        field: val.path,
        message: val.message,
      }));
    }

    // Mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid format for field: ${error.path}`;
    }

    // JWT Errors
    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token. Please log in again.';
    }

    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token has expired. Please log in again.';
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(env.isDev && { stack: error.stack }),
  };

  // Log non-operational (500) unexpected errors in server logs
  if (error.statusCode >= 500) {
    console.error(`\x1b[31m[UNHANDLED ERROR] ${req.method} ${req.originalUrl}\x1b[0m`);
    console.error(error);
  }

  return res.status(error.statusCode).json(responsePayload);
};

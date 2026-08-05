/**
 * High-order async wrapper function to pass errors to Express error middleware
 * without requiring try/catch blocks in every controller.
 *
 * @param {Function} requestHandler - Async Express request handler
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

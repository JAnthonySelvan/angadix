/**
 * Standardized success response structure for all API endpoints.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {any} data - Payload data
   * @param {string} message - Human-readable success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const tokenService = {
  /**
   * Verify Access Token
   * @param {string} token
   * @returns {Object} decoded payload
   */
  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, env.jwt.accessSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token has expired. Please refresh your session.');
      }
      throw new ApiError(401, 'Invalid access token.');
    }
  },

  /**
   * Verify Refresh Token
   * @param {string} token
   * @returns {Object} decoded payload
   */
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, env.jwt.refreshSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Refresh token has expired. Please log in again.');
      }
      throw new ApiError(401, 'Invalid refresh token.');
    }
  },

  /**
   * Generate a random unhashed hex token & its SHA-256 hash
   * Used for email verification and password reset links
   */
  generateRandomToken: () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    return { rawToken, hashedToken };
  },

  /**
   * Hash a raw token with SHA-256 for lookup matching
   * @param {string} rawToken
   */
  hashToken: (rawToken) => {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  },
};

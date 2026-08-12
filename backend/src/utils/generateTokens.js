import { env } from '../config/env.js';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd || process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || (env.isProd ? 'none' : 'lax'),
  path: '/',
};

export const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
};

export const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
  * Sets token cookies on response object
  * @param {Object} res - Express response
  * @param {string} accessToken - JWT access token
  * @param {string} refreshToken - JWT refresh token
  */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

/**
  * Clears token cookies on response object
  * @param {Object} res - Express response
  */
export const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  res.cookie('refreshToken', '', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
};

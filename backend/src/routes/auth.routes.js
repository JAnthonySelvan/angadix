import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  googleLogin,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resendVerificationValidator,
  resetPasswordValidator,
} from '../validators/auth.validator.js';

const router = Router();

// Strict Rate Limiter for Sensitive Auth Actions (Login, Register, Password Reset, Google OAuth)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 15 requests per 15 minutes window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many auth requests from this IP. Please try again after 15 minutes.',
    errors: [],
  },
});

// 1. Register Route
router.post('/register', authLimiter, validate(registerValidator), register);

// 2. Login Route
router.post('/login', authLimiter, validate(loginValidator), login);

// 3. Logout Route
router.post('/logout', logout);

// 4. Get Current User (Me) Route
router.get('/me', protect, getMe);

// 5. Refresh Access Token Route
router.post('/refresh-token', refreshToken);

// 6. Verify Email Token Route
router.get('/verify-email/:token', verifyEmail);

// 7. Resend Email Verification Route
router.post(
  '/resend-verification',
  authLimiter,
  validate(resendVerificationValidator),
  resendVerification
);

// 8. Forgot Password Route
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidator), forgotPassword);

// 9. Reset Password Route
router.post('/reset-password/:token', validate(resetPasswordValidator), resetPassword);

// 10. Google OAuth 2.0 Route
router.post('/google', authLimiter, googleLogin);

export default router;

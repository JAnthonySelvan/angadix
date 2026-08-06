import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.js';
import { tokenService } from '../services/token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { setTokenCookies, clearTokenCookies } from '../utils/generateTokens.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import axios from 'axios';

const googleClient = new OAuth2Client(env.google.clientId);

/**
 * Helper to sanitize user document before returning to client
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpiry;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpiry;
  delete userObj.googleId;
  return userObj;
};

// 1. Register User
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  // Generate Email Verification Token
  const { rawToken, hashedToken } = tokenService.generateRandomToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create User Record
  const user = await User.create({
    name,
    email,
    password,
    isEmailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: verificationExpiry,
  });

  // Send Verification Email via SMTP
  await sendVerificationEmail(user.email, user.name, rawToken);

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: sanitizeUser(user) },
      'Registration successful. Please check your email to verify your account.'
    )
  );
});

// 2. Login User
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Verify password match
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'Your email address is not verified. Please verify your email before logging in.'
    );
  }

  // Generate Tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set HTTP-only cookies
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: sanitizeUser(user),
        accessToken,
      },
      'Login successful.'
    )
  );
});

// 3. Logout User
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (incomingRefreshToken) {
    try {
      const decoded = tokenService.verifyRefreshToken(incomingRefreshToken);
      await User.findByIdAndUpdate(decoded._id, { $unset: { refreshToken: 1 } });
    } catch {
      // Ignore token verification errors during logout
    }
  } else if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  clearTokenCookies(res);

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

// 4. Get Current Authenticated User Profile (Me)
export const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, sanitizeUser(req.user), 'Current user profile fetched successfully.')
    );
});

// 5. Refresh Access Token
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required.');
  }

  // Verify refresh token
  const decoded = tokenService.verifyRefreshToken(incomingRefreshToken);

  // Find user with refresh token
  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    clearTokenCookies(res);
    throw new ApiError(401, 'Invalid or revoked refresh token. Please log in again.');
  }

  // Generate new token pair (token rotation)
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, newAccessToken, newRefreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken: newAccessToken },
      'Token refreshed successfully.'
    )
  );
});

// 6. Verify Email Address
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = (req.params.token || req.query.token || '').trim();

  if (!token) {
    throw new ApiError(400, 'Verification token is required.');
  }

  const hashedToken = tokenService.hashToken(token);

  // Find user matching token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired email verification token.');
  }

  // Check token expiry
  if (user.emailVerificationExpiry && user.emailVerificationExpiry < Date.now()) {
    throw new ApiError(
      400,
      'Email verification link has expired. Please request a new verification email.'
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'Email verified successfully. You can now log in to your Angadix account.'
      )
    );
});

// 7. Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Generic success message to prevent user enumeration attacks
  const genericSuccessMsg =
    'If an account with that email address exists, password reset instructions have been sent.';

  if (!user) {
    return res.status(200).json(new ApiResponse(200, null, genericSuccessMsg));
  }

  const { rawToken, hashedToken } = tokenService.generateRandomToken();
  const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = resetExpiry;
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(user.email, user.name, rawToken);

  return res.status(200).json(new ApiResponse(200, null, genericSuccessMsg));
});

// 8. Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const token = (req.params.token || req.query.token || req.body.token || '').trim();
  const { password } = req.body;

  if (!token) {
    throw new ApiError(400, 'Reset token is required.');
  }

  const hashedToken = tokenService.hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpiry');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token.');
  }

  // Update password & clear reset tokens and active refresh sessions
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  user.refreshToken = undefined;

  await user.save(); // Triggers password hash hook

  clearTokenCookies(res);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'Password reset successful. Please log in with your new password.'
      )
    );
});

// 9. Resend Verification Email
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }

  const user = await User.findOne({ email });

  const genericMsg =
    'If an unverified account with that email exists, a new verification link has been sent.';

  if (!user) {
    return res.status(200).json(new ApiResponse(200, null, genericMsg));
  }

  if (user.isEmailVerified) {
    throw new ApiError(
      400,
      'This email address is already verified. You can log in directly.'
    );
  }

  // Generate new verification token
  const { rawToken, hashedToken } = tokenService.generateRandomToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = verificationExpiry;
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user.email, user.name, rawToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Verification email sent successfully! Please check your inbox.'
    )
  );
});

// 10. Google OAuth 2.0 Login / Find-or-Create
export const googleLogin = asyncHandler(async (req, res) => {
  const idToken = req.body.idToken || req.body.token || req.body.credential;

  if (!idToken) {
    throw new ApiError(400, 'Google authentication token is required.');
  }

  let payload;

  // Dual verification mode:
  // 1. JWT ID Token (starts with 'ey') -> verified via OAuth2Client.verifyIdToken
  // 2. OAuth2 Access Token (starts with 'ya29' or other) -> verified via Google UserInfo API
  if (typeof idToken === 'string' && idToken.startsWith('ey')) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.google.clientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        throw new ApiError(
          503,
          'Google authentication service is currently unreachable. Please try again.'
        );
      }
      throw new ApiError(401, 'Invalid or expired Google ID token.');
    }
  } else {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      payload = response.data;
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        throw new ApiError(
          503,
          'Google authentication service is currently unreachable. Please try again.'
        );
      }
      throw new ApiError(401, 'Invalid or expired Google access token.');
    }
  }

  if (!payload) {
    throw new ApiError(401, 'Invalid Google token payload.');
  }

  const { email, name, picture, sub: googleId, email_verified } = payload;

  if (!email_verified && email_verified !== 'true') {
    throw new ApiError(
      400,
      'Your email address is unverified on Google. Please verify your email on Google before proceeding.'
    );
  }

  // Find user by googleId or email
  let user = await User.findOne({ googleId }).select('+googleId');

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      // Auto-link Google account to existing local user account
      user.googleId = googleId;
      user.isEmailVerified = true;
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user record
      user = await User.create({
        name: name || 'Angadix User',
        email,
        authProvider: 'google',
        googleId,
        isEmailVerified: true,
        avatar: picture || '',
      });
    }
  }

  // Issue Access & Refresh Tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set HTTP-only cookies
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: sanitizeUser(user),
        accessToken,
      },
      'Google authentication successful.'
    )
  );
});

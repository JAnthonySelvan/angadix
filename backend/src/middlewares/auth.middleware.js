import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { tokenService } from '../services/token.service.js';
import { User } from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Fallback to Authorization Header (Bearer token)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing. Please log in.');
  }

  // 3. Verify token signature and expiration
  const decoded = tokenService.verifyAccessToken(token);

  // 4. Fetch user from DB
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(
      401,
      'User account associated with token no longer exists.'
    );
  }

  if (user.isBlocked) {
    throw new ApiError(
      403,
      'Your account has been suspended. Contact support.'
    );
  }

  // 5. Attach authenticated user to request context
  req.user = user;
  next();
});

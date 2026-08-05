import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.js';

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpiry;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpiry;
  return userObj;
};

// 1. Get User Profile
export const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, sanitizeUser(req.user), 'User profile fetched.'));
});

// 2. Update Profile (Name/Avatar)
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (avatar !== undefined) updates.avatar = avatar;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sanitizeUser(updatedUser),
        'User profile updated successfully.'
      )
    );
});

// 3. Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password provided is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'Password updated successfully. Please log in with your new password on other devices.'
      )
    );
});

// 4. Admin: Get All Users (Paginated)
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  const sanitizedUsers = users.map(sanitizeUser);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: sanitizedUsers,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          limit,
        },
      },
      'User list fetched successfully.'
    )
  );
});

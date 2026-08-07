import { User } from '../../models/User.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

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

/**
 * @desc    Get paginated users list with search & role filter
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAdminUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const { search, role, isBlocked } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, totalUsers] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
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

/**
 * @desc    Toggle user blocked status
 * @route   PATCH /api/v1/admin/users/:id/block
 * @access  Private/Admin
 */
export const toggleUserBlock = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'Security Guard: You cannot block your own admin account.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, `User with ID '${id}' not found.`);
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      sanitizeUser(user),
      `User account ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`
    )
  );
});

/**
 * @desc    Change user role (user/admin)
 * @route   PATCH /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, "Invalid role. Role must be either 'user' or 'admin'.");
  }

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'Security Guard: Self-demotion is prohibited. You cannot change your own role.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, `User with ID '${id}' not found.`);
  }

  user.role = role;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      sanitizeUser(user),
      `User role updated to '${role}' successfully.`
    )
  );
});

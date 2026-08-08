import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Notification } from '../models/Notification.js';

/**
 * Helper utility to create an in-app notification without blocking execution
 */
export const createInAppNotification = async ({
  userId,
  type = 'system',
  title,
  message,
  link,
  metadata = {},
}) => {
  try {
    if (!userId || !title || !message) return;
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
    });
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
  }
};

/**
 * @desc Get user notifications (unread first, paginated)
 * @route GET /api/v1/notifications
 * @access Private (User)
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const userId = req.user._id;

  const skip = (page - 1) * limit;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ isRead: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
      },
      'Notifications fetched successfully'
    )
  );
});

/**
 * @desc Get unread notification count
 * @route GET /api/v1/notifications/unread-count
 * @access Private (User)
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await Notification.countDocuments({ user: userId, isRead: false });

  return res.status(200).json(
    new ApiResponse(200, { count }, 'Unread notification count fetched')
  );
});

/**
 * @desc Mark single notification as read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Private (User)
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { notification, unreadCount },
      'Notification marked as read'
    )
  );
});

/**
 * @desc Mark all user notifications as read
 * @route PATCH /api/v1/notifications/read-all
 * @access Private (User)
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

  return res.status(200).json(
    new ApiResponse(200, { unreadCount: 0 }, 'All notifications marked as read')
  );
});

/**
 * @desc Delete a notification
 * @route DELETE /api/v1/notifications/:id
 * @access Private (User)
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  return res.status(200).json(
    new ApiResponse(200, { notificationId: id, unreadCount }, 'Notification deleted')
  );
});

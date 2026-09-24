const express = require('express');
const Notification = require('../models/Notification');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { NotFoundError } = require('../utils/customErrors');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

/**
 * @route GET /api/v1/notifications
 * @desc Get user notifications with optional unread filter and pagination
 */
router.get('/', asyncWrapper(async (req, res) => {
  const { read, priority, limit = 50, page = 1 } = req.query;
  const filter = { userId: req.user._id };

  if (read !== undefined) {
    filter.read = read === 'true';
  }
  if (priority) {
    filter.priority = priority.toUpperCase();
  }

  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * parsedLimit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, read: false })
  ]);

  return sendSuccess(res, 'Notifications retrieved', {
    unreadCount,
    total,
    page: parseInt(page, 10) || 1,
    totalPages: Math.ceil(total / parsedLimit),
    notifications
  });
}));

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark single notification as read
 */
router.patch('/:id/read', asyncWrapper(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!notification) {
    throw new NotFoundError('Notification not found.');
  }

  notification.read = true;
  await notification.save();

  return sendSuccess(res, 'Notification marked as read', notification);
}));

/**
 * @route PATCH /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 */
router.patch('/read-all', asyncWrapper(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  return sendSuccess(res, 'All notifications marked as read');
}));

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Delete a notification
 */
router.delete('/:id', asyncWrapper(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!notification) {
    throw new NotFoundError('Notification not found.');
  }
  return sendSuccess(res, 'Notification deleted successfully');
}));

module.exports = router;

const express = require('express');
const Notification = require('../models/Notification');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { validatePagination } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const type = req.query.type; // Filter by notification type
  const unreadOnly = req.query.unreadOnly === 'true';
  const category = req.query.category; // social, professional, system

  // Build query
  const query = { recipient: req.user._id };
  
  if (type) {
    query.type = type;
  }
  
  if (unreadOnly) {
    query.isRead = false;
  }

  if (category) {
    query.category = category;
  }

  const totalNotifications = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  const notifications = await Notification.find(query)
    .populate('sender', 'profile.firstName profile.lastName profile.profilePicture profile.headline')
    .populate('relatedPost', 'content type media createdAt')
    .populate('relatedJob', 'title company location')
    .populate('relatedConnection', 'status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalNotifications / limit);

  successResponse(res, 200, 'Notifications retrieved successfully', {
    notifications,
    unreadCount,
    pagination: {
      currentPage: page,
      totalPages,
      totalNotifications,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticateToken, asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  const categoryCounts = await Notification.aggregate([
    { $match: { recipient: req.user._id, isRead: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const categoryBreakdown = {
    social: 0,
    professional: 0,
    system: 0
  };

  categoryCounts.forEach(cat => {
    categoryBreakdown[cat._id] = cat.count;
  });

  successResponse(res, 200, 'Unread count retrieved successfully', {
    unreadCount,
    categoryBreakdown
  });
}));

/**
 * @route   GET /api/notifications/summary
 * @desc    Get notification summary/digest
 * @access  Private
 */
router.get('/summary', authenticateToken, asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || 'today'; // today, week, month
  
  let dateFilter;
  const now = new Date();
  
  switch (timeframe) {
    case 'today':
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const summary = await Notification.aggregate([
    {
      $match: {
        recipient: req.user._id,
        createdAt: { $gte: dateFilter }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        latest: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const totalNotifications = summary.reduce((sum, item) => sum + item.count, 0);
  const totalUnread = summary.reduce((sum, item) => sum + item.unread, 0);

  successResponse(res, 200, 'Notification summary retrieved successfully', {
    timeframe,
    totalNotifications,
    totalUnread,
    breakdown: summary
  });
}));

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticateToken, asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return next(createError(404, 'Notification not found'));
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  successResponse(res, 200, 'Notification marked as read');
}));

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', authenticateToken, asyncHandler(async (req, res) => {
  const { type, category } = req.query;
  
  const updateQuery = { 
    recipient: req.user._id,
    isRead: false
  };
  
  if (type) {
    updateQuery.type = type;
  }
  
  if (category) {
    updateQuery.category = category;
  }

  const result = await Notification.updateMany(
    updateQuery,
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      } 
    }
  );

  successResponse(res, 200, 'Notifications marked as read', {
    modifiedCount: result.modifiedCount
  });
}));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return next(createError(404, 'Notification not found'));
  }

  await Notification.findByIdAndDelete(req.params.id);

  successResponse(res, 200, 'Notification deleted successfully');
}));

/**
 * @route   DELETE /api/notifications/clear
 * @desc    Clear notifications (bulk delete)
 * @access  Private
 */
router.delete('/clear', authenticateToken, asyncHandler(async (req, res) => {
  const { type, category, readOnly } = req.query;
  
  const deleteQuery = { recipient: req.user._id };
  
  if (type) {
    deleteQuery.type = type;
  }
  
  if (category) {
    deleteQuery.category = category;
  }

  if (readOnly === 'true') {
    deleteQuery.isRead = true;
  }

  const result = await Notification.deleteMany(deleteQuery);

  successResponse(res, 200, 'Notifications cleared successfully', {
    deletedCount: result.deletedCount
  });
}));

/**
 * @route   POST /api/notifications/:id/action
 * @desc    Perform action on notification (accept, decline, etc.)
 * @access  Private
 */
router.post('/:id/action', authenticateToken, asyncHandler(async (req, res, next) => {
  const { action } = req.body;

  if (!action) {
    return next(createError(400, 'Action is required'));
  }

  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return next(createError(404, 'Notification not found'));
  }

  if (!notification.actionRequired) {
    return next(createError(400, 'This notification does not require action'));
  }

  // Check if action is valid for this notification
  const validActions = notification.actions.map(a => a.type);
  if (!validActions.includes(action)) {
    return next(createError(400, 'Invalid action for this notification'));
  }

  // Find the action details
  const actionDetails = notification.actions.find(a => a.type === action);

  try {
    // Handle different action types
    switch (notification.type) {
      case 'connection_request':
        if (action === 'accept') {
          // Make API call to accept connection
          const Connection = require('../models/Connection');
          const connectionRequest = await Connection.findById(notification.relatedConnection);
          if (connectionRequest && connectionRequest.status === 'pending') {
            connectionRequest.status = 'accepted';
            connectionRequest.respondedAt = new Date();
            await connectionRequest.save();
          }
        } else if (action === 'decline') {
          // Make API call to decline connection
          const Connection = require('../models/Connection');
          const connectionRequest = await Connection.findById(notification.relatedConnection);
          if (connectionRequest && connectionRequest.status === 'pending') {
            connectionRequest.status = 'declined';
            connectionRequest.respondedAt = new Date();
            await connectionRequest.save();
          }
        }
        break;
      
      case 'job_application':
        // For job applications, actions would be handled by job poster
        // This would typically redirect to application management
        break;
      
      default:
        // For other types, just mark as actioned
        break;
    }

    // Mark notification as read and actioned
    notification.isRead = true;
    notification.readAt = new Date();
    notification.actionTaken = action;
    notification.actionTakenAt = new Date();
    await notification.save();

    successResponse(res, 200, 'Action performed successfully', {
      action,
      redirectUrl: actionDetails.url
    });

  } catch (error) {
    return next(createError(500, 'Failed to perform action'));
  }
}));

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const {
    emailNotifications,
    pushNotifications,
    inAppNotifications,
    notificationTypes
  } = req.body;

  const User = require('../models/User');
  const user = await User.findById(req.user._id);

  // Update notification preferences
  if (emailNotifications !== undefined) {
    user.preferences.notifications.email = emailNotifications;
  }
  
  if (pushNotifications !== undefined) {
    user.preferences.notifications.push = pushNotifications;
  }
  
  if (inAppNotifications !== undefined) {
    user.preferences.notifications.inApp = inAppNotifications;
  }

  if (notificationTypes) {
    user.preferences.notifications.types = {
      ...user.preferences.notifications.types,
      ...notificationTypes
    };
  }

  await user.save();

  successResponse(res, 200, 'Notification preferences updated successfully', {
    preferences: user.preferences.notifications
  });
}));

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user's notification preferences
 * @access  Private
 */
router.get('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user._id).select('preferences.notifications');

  successResponse(res, 200, 'Notification preferences retrieved successfully', {
    preferences: user.preferences.notifications
  });
}));

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification (development only)
 * @access  Private
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test', authenticateToken, asyncHandler(async (req, res) => {
    const { type = 'system', title = 'Test Notification', message = 'This is a test notification' } = req.body;

    await Notification.createNotification({
      recipient: req.user._id,
      type,
      title,
      message,
      category: 'system'
    });

    successResponse(res, 201, 'Test notification sent successfully');
  }));
}

/**
 * @route   GET /api/notifications/export
 * @desc    Export user's notifications
 * @access  Private
 */
router.get('/export', authenticateToken, asyncHandler(async (req, res) => {
  const format = req.query.format || 'json'; // json, csv
  const timeframe = req.query.timeframe || 'all'; // all, month, year

  let dateFilter = {};
  if (timeframe !== 'all') {
    const now = new Date();
    if (timeframe === 'month') {
      dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (timeframe === 'year') {
      dateFilter.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
    }
  }

  const notifications = await Notification.find({
    recipient: req.user._id,
    ...dateFilter
  })
  .populate('sender', 'profile.firstName profile.lastName')
  .sort({ createdAt: -1 })
  .lean();

  if (format === 'csv') {
    const csv = notifications.map(notif => ({
      date: notif.createdAt.toISOString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      sender: notif.sender ? `${notif.sender.profile.firstName} ${notif.sender.profile.lastName}` : 'System',
      isRead: notif.isRead,
      category: notif.category
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=notifications.csv');
    
    const csvContent = [
      ['Date', 'Type', 'Title', 'Message', 'Sender', 'Read', 'Category'],
      ...csv.map(row => [
        row.date,
        row.type,
        row.title,
        row.message,
        row.sender,
        row.isRead,
        row.category
      ])
    ].map(row => row.join(',')).join('\n');

    res.send(csvContent);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=notifications.json');
    res.json({
      exportDate: new Date().toISOString(),
      timeframe,
      totalNotifications: notifications.length,
      notifications
    });
  }
}));

module.exports = router;

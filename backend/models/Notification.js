const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'post_like',
      'post_comment',
      'post_share',
      'post_mention',
      'job_application',
      'job_recommendation',
      'profile_view',
      'skill_endorsement',
      'birthday',
      'work_anniversary',
      'achievement',
      'event_reminder',
      'message',
      'system',
      'promotion',
      'security'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedConnection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actions: [{
    label: String,
    type: {
      type: String,
      enum: ['accept', 'decline', 'view', 'reply', 'ignore', 'custom']
    },
    url: String,
    payload: mongoose.Schema.Types.Mixed
  }],
  channel: {
    type: String,
    enum: ['in_app', 'email', 'push', 'sms'],
    default: 'in_app'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending'
  },
  deliveredAt: Date,
  failureReason: String,
  metadata: {
    userAgent: String,
    ipAddress: String,
    device: String,
    platform: String,
    source: String,
    campaign: String
  },
  expiresAt: Date,
  groupKey: String, // For grouping related notifications
  template: String, // Template identifier for consistent formatting
  localization: {
    language: String,
    region: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as deleted
notificationSchema.methods.markAsDeleted = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Emit real-time notification if recipient is online (only in non-test environment)
  try {
    const socketHandler = require('../socket/socketHandler');
    if (socketHandler.getIO) {
      const io = socketHandler.getIO();
      if (io) {
        io.to(`user:${data.recipient}`).emit('notification', notification);
      }
    }
  } catch (error) {
    // Socket.io not available in test environment - this is fine
    console.log('Socket.io not available for real-time notifications');
  }
  
  return notification;
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false,
      isDeleted: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to get grouped notifications
notificationSchema.statics.getGroupedNotifications = async function(userId, options = {}) {
  const { limit = 20, skip = 0, type } = options;
  
  const matchStage = {
    recipient: new mongoose.Types.ObjectId(userId),
    isDeleted: false
  };
  
  if (type) {
    matchStage.type = type;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$groupKey',
        notifications: { $push: '$$ROOT' },
        count: { $sum: 1 },
        latestNotification: { $max: '$createdAt' },
        hasUnread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
      }
    },
    { $sort: { latestNotification: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);
};

// Static method to clean up old notifications
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Pre-save middleware to set expiration
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set default expiration based on type
    const now = new Date();
    switch (this.type) {
      case 'connection_request':
        this.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'job_recommendation':
        this.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'event_reminder':
        this.expiresAt = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
        break;
      default:
        this.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }
  
  // Set group key if not provided
  if (this.isNew && !this.groupKey) {
    if (this.relatedPost) {
      this.groupKey = `post:${this.relatedPost}`;
    } else if (this.relatedJob) {
      this.groupKey = `job:${this.relatedJob}`;
    } else if (this.sender) {
      this.groupKey = `user:${this.sender}:${this.type}`;
    } else {
      this.groupKey = `system:${this.type}`;
    }
  }
  
  next();
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isDeleted: 1 });
notificationSchema.index({ groupKey: 1, createdAt: -1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ relatedPost: 1 });
notificationSchema.index({ relatedJob: 1 });
notificationSchema.index({ relatedConnection: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ createdAt: 1 }); // For cleanup operations

// Compound indexes
notificationSchema.index({ recipient: 1, isRead: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

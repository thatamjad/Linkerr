const express = require('express');
const { jobScrapingService } = require('../services/jobScrapingService');
const Job = require('../models/Job');
const User = require('../models/User');
const Post = require('../models/Post');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware to require admin role for all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalPosts,
    totalJobs,
    totalConnections,
    totalNotifications,
    recentUsers,
    recentPosts,
    recentJobs
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ 'activity.isOnline': true }),
    Post.countDocuments(),
    Job.countDocuments(),
    Connection.countDocuments({ status: 'accepted' }),
    Notification.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('profile.firstName profile.lastName profile.email createdAt'),
    Post.find().sort({ createdAt: -1 }).limit(5).populate('author', 'profile.firstName profile.lastName'),
    Job.find().sort({ createdAt: -1 }).limit(5).populate('postedBy', 'profile.firstName profile.lastName')
  ]);

  const userGrowth = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  successResponse(res, 200, 'Dashboard statistics retrieved successfully', {
    statistics: {
      totalUsers,
      activeUsers,
      totalPosts,
      totalJobs,
      totalConnections,
      totalNotifications,
      userGrowthRate: userGrowth.length > 1 ? 
        ((userGrowth[0].count - userGrowth[1].count) / userGrowth[1].count * 100).toFixed(2) : 0
    },
    recentActivity: {
      users: recentUsers,
      posts: recentPosts,
      jobs: recentJobs
    },
    userGrowth
  });
}));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with admin controls
 * @access  Admin only
 */
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const status = req.query.status; // active, inactive, suspended

  const query = {};
  
  if (search) {
    query.$or = [
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    switch (status) {
      case 'active':
        query.isActive = true;
        break;
      case 'inactive':
        query.isActive = false;
        break;
      case 'suspended':
        query.isSuspended = true;
        break;
    }
  }

  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalUsers / limit);

  successResponse(res, 200, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Update user status (suspend/activate)
 * @access  Admin only
 */
router.put('/users/:userId/status', asyncHandler(async (req, res, next) => {
  const { status, reason } = req.body;

  if (!['active', 'suspended', 'inactive'].includes(status)) {
    return next(createError(400, 'Invalid status'));
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Update user status
  user.isActive = status === 'active';
  user.isSuspended = status === 'suspended';
  
  if (status === 'suspended' && reason) {
    user.suspensionReason = reason;
    user.suspendedAt = new Date();
    user.suspendedBy = req.user._id;
  }

  await user.save();

  successResponse(res, 200, `User status updated to ${status}`, {
    userId: user._id,
    status,
    reason
  });
}));

/**
 * @route   GET /api/admin/jobs/scraping/status
 * @desc    Get job scraping status
 * @access  Admin only
 */
router.get('/jobs/scraping/status', asyncHandler(async (req, res) => {
  const status = jobScrapingService.getScrapingStatus();
  
  const scrapingStats = await Job.aggregate([
    {
      $match: { isExternal: true }
    },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 },
        recent: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  successResponse(res, 200, 'Job scraping status retrieved successfully', {
    ...status,
    statistics: scrapingStats
  });
}));

/**
 * @route   POST /api/admin/jobs/scraping/trigger
 * @desc    Manually trigger job scraping
 * @access  Admin only
 */
router.post('/jobs/scraping/trigger', asyncHandler(async (req, res) => {
  try {
    await jobScrapingService.triggerScraping();
    
    successResponse(res, 200, 'Job scraping triggered successfully');
  } catch (error) {
    if (error.message.includes('already in progress')) {
      return res.status(409).json({
        success: false,
        message: 'Job scraping already in progress'
      });
    }
    throw error;
  }
}));

/**
 * @route   DELETE /api/admin/jobs/cleanup
 * @desc    Clean up old external jobs
 * @access  Admin only
 */
router.delete('/jobs/cleanup', asyncHandler(async (req, res) => {
  const deletedCount = await jobScrapingService.cleanupOldJobs();
  
  successResponse(res, 200, 'Job cleanup completed', {
    deletedCount
  });
}));

/**
 * @route   GET /api/admin/content/reports
 * @desc    Get content reports (posts, jobs, users)
 * @access  Admin only
 */
router.get('/content/reports', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const type = req.query.type; // post, job, user

  // Get reported posts
  const reportedPosts = await Post.find({ 
    'reports.0': { $exists: true },
    ...(type === 'post' ? {} : { $where: 'false' })
  })
    .populate('author', 'profile.firstName profile.lastName profile.email')
    .populate('reports.reporter', 'profile.firstName profile.lastName')
    .sort({ 'reports.reportedAt': -1 })
    .skip(type === 'post' ? skip : 0)
    .limit(type === 'post' ? limit : 10)
    .lean();

  // Get reported jobs
  const reportedJobs = await Job.find({ 
    'reports.0': { $exists: true },
    ...(type === 'job' ? {} : { $where: 'false' })
  })
    .populate('postedBy', 'profile.firstName profile.lastName profile.email')
    .populate('reports.reporter', 'profile.firstName profile.lastName')
    .sort({ 'reports.reportedAt': -1 })
    .skip(type === 'job' ? skip : 0)
    .limit(type === 'job' ? limit : 10)
    .lean();

  const reports = {
    posts: reportedPosts.map(post => ({
      id: post._id,
      type: 'post',
      content: post.content.substring(0, 100) + '...',
      author: post.author,
      reports: post.reports,
      reportCount: post.reports.length,
      createdAt: post.createdAt
    })),
    jobs: reportedJobs.map(job => ({
      id: job._id,
      type: 'job',
      title: job.title,
      company: job.company,
      postedBy: job.postedBy,
      reports: job.reports,
      reportCount: job.reports.length,
      createdAt: job.createdAt
    }))
  };

  const allReports = [...reports.posts, ...reports.jobs];
  const totalReports = allReports.length;
  const totalPages = Math.ceil(totalReports / limit);

  successResponse(res, 200, 'Content reports retrieved successfully', {
    reports: allReports.slice(skip, skip + limit),
    pagination: {
      currentPage: page,
      totalPages,
      totalReports,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   PUT /api/admin/content/reports/:id/resolve
 * @desc    Resolve content report
 * @access  Admin only
 */
router.put('/content/reports/:id/resolve', asyncHandler(async (req, res, next) => {
  const { type, action } = req.body; // type: post/job, action: dismiss/remove/suspend_user
  
  if (!['post', 'job'].includes(type)) {
    return next(createError(400, 'Invalid content type'));
  }

  if (!['dismiss', 'remove', 'suspend_user'].includes(action)) {
    return next(createError(400, 'Invalid action'));
  }

  let content;
  
  if (type === 'post') {
    content = await Post.findById(req.params.id);
  } else {
    content = await Job.findById(req.params.id);
  }

  if (!content) {
    return next(createError(404, 'Content not found'));
  }

  switch (action) {
    case 'dismiss':
      // Just clear the reports
      content.reports = [];
      await content.save();
      break;
      
    case 'remove':
      // Delete the content
      if (type === 'post') {
        await Post.findByIdAndDelete(req.params.id);
      } else {
        await Job.findByIdAndDelete(req.params.id);
      }
      break;
      
    case 'suspend_user':
      // Suspend the user and remove content
      const userId = type === 'post' ? content.author : content.postedBy;
      await User.findByIdAndUpdate(userId, {
        isSuspended: true,
        suspensionReason: 'Content violation',
        suspendedAt: new Date(),
        suspendedBy: req.user._id
      });
      
      if (type === 'post') {
        await Post.findByIdAndDelete(req.params.id);
      } else {
        await Job.findByIdAndDelete(req.params.id);
      }
      break;
  }

  successResponse(res, 200, `Report resolved with action: ${action}`);
}));

/**
 * @route   GET /api/admin/analytics
 * @desc    Get platform analytics
 * @access  Admin only
 */
router.get('/analytics', asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || '30d'; // 7d, 30d, 90d, 1y
  
  let dateFilter;
  const now = new Date();
  
  switch (timeframe) {
    case '7d':
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [
    newUsers,
    newPosts,
    newJobs,
    newConnections,
    postEngagement,
    jobApplications
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: dateFilter } }),
    Post.countDocuments({ createdAt: { $gte: dateFilter } }),
    Job.countDocuments({ createdAt: { $gte: dateFilter } }),
    Connection.countDocuments({ 
      createdAt: { $gte: dateFilter },
      status: 'accepted'
    }),
    Post.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$likeCount' },
          totalComments: { $sum: '$commentCount' },
          totalShares: { $sum: '$shareCount' }
        }
      }
    ]),
    Job.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: '$applicationCount' }
        }
      }
    ])
  ]);

  const engagement = postEngagement[0] || { totalLikes: 0, totalComments: 0, totalShares: 0 };
  const applications = jobApplications[0] || { totalApplications: 0 };

  successResponse(res, 200, 'Analytics retrieved successfully', {
    timeframe,
    metrics: {
      newUsers,
      newPosts,
      newJobs,
      newConnections,
      totalEngagement: engagement.totalLikes + engagement.totalComments + engagement.totalShares,
      totalJobApplications: applications.totalApplications
    },
    engagement,
    applications
  });
}));

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Send broadcast notification to all users
 * @access  Admin only
 */
router.post('/notifications/broadcast', asyncHandler(async (req, res) => {
  const { title, message, type = 'system', category = 'system' } = req.body;

  if (!title || !message) {
    return next(createError(400, 'Title and message are required'));
  }

  // Get all active users
  const activeUsers = await User.find({ isActive: true }).select('_id');
  
  // Create notifications for all users (in batches to avoid memory issues)
  const batchSize = 1000;
  let totalSent = 0;
  
  for (let i = 0; i < activeUsers.length; i += batchSize) {
    const batch = activeUsers.slice(i, i + batchSize);
    const notifications = batch.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type,
      category,
      title,
      message,
      createdAt: new Date()
    }));
    
    await Notification.insertMany(notifications);
    totalSent += notifications.length;
  }

  successResponse(res, 200, 'Broadcast notification sent successfully', {
    totalSent
  });
}));

module.exports = router;

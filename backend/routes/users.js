const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Connection = require('../models/Connection');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { validateProfileUpdate, validatePagination } = require('../middleware/validation');
const { 
  authenticateToken, 
  authenticateOptionalToken, 
  checkPrivacySettings,
  requireOwnership
} = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Allow profile picture and cover photo
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Public
 */
router.get('/', validatePagination, authenticateOptionalToken, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const industry = req.query.industry;
  const location = req.query.location;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Build query
  const query = { isActive: true };
  
  // Add search filter
  if (search) {
    query.$or = [
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { 'profile.headline': { $regex: search, $options: 'i' } },
      { 'profile.skills.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Add filters
  if (industry) {
    query['profile.industry'] = industry;
  }
  
  if (location) {
    query['profile.location'] = { $regex: location, $options: 'i' };
  }

  // Get total count for pagination
  const totalUsers = await User.countDocuments(query);
  
  // Get users
  const users = await User.find(query)
    .select('profile isVerified createdAt analytics')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  // Calculate pagination info
  const totalPages = Math.ceil(totalUsers / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  successResponse(res, 200, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNextPage,
      hasPrevPage,
      limit
    }
  });
}));

/**
 * @route   GET /api/users/search
 * @desc    Advanced user search
 * @access  Private
 */
router.get('/search', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const {
    q: searchQuery,
    skills,
    industry,
    location,
    experienceLevel,
    company
  } = req.query;

  // Build aggregation pipeline
  const pipeline = [];

  // Match stage
  const matchStage = {
    $match: {
      isActive: true,
      _id: { $ne: req.user._id } // Exclude current user
    }
  };

  if (searchQuery) {
    matchStage.$match.$text = { $search: searchQuery };
  }

  if (industry) {
    matchStage.$match['profile.industry'] = industry;
  }

  if (location) {
    matchStage.$match['profile.location'] = { $regex: location, $options: 'i' };
  }

  pipeline.push(matchStage);

  // Add score for text search
  if (searchQuery) {
    pipeline.push({
      $addFields: {
        searchScore: { $meta: 'textScore' }
      }
    });
  }

  // Skills filter
  if (skills) {
    const skillsArray = skills.split(',');
    pipeline.push({
      $match: {
        'profile.skills.name': { $in: skillsArray }
      }
    });
  }

  // Experience level filter
  if (experienceLevel) {
    pipeline.push({
      $match: {
        'profile.experience.level': experienceLevel
      }
    });
  }

  // Company filter
  if (company) {
    pipeline.push({
      $match: {
        'profile.experience.company': { $regex: company, $options: 'i' }
      }
    });
  }

  // Add connection status
  pipeline.push({
    $lookup: {
      from: 'connections',
      let: { userId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $or: [
                    { $and: [{ $eq: ['$requester', req.user._id] }, { $eq: ['$recipient', '$$userId'] }] },
                    { $and: [{ $eq: ['$recipient', req.user._id] }, { $eq: ['$requester', '$$userId'] }] }
                  ]
                }
              ]
            }
          }
        }
      ],
      as: 'connectionStatus'
    }
  });

  pipeline.push({
    $addFields: {
      connectionStatus: {
        $cond: {
          if: { $eq: [{ $size: '$connectionStatus' }, 0] },
          then: 'not_connected',
          else: { $arrayElemAt: ['$connectionStatus.status', 0] }
        }
      }
    }
  });

  // Sort stage
  const sortStage = { $sort: {} };
  if (searchQuery) {
    sortStage.$sort.searchScore = { $meta: 'textScore' };
  } else {
    sortStage.$sort.createdAt = -1;
  }
  pipeline.push(sortStage);

  // Project stage
  pipeline.push({
    $project: {
      profile: 1,
      isVerified: 1,
      createdAt: 1,
      connectionStatus: 1,
      searchScore: 1
    }
  });

  // Get total count
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: 'total' });
  const totalResult = await User.aggregate(countPipeline);
  const totalUsers = totalResult.length > 0 ? totalResult[0].total : 0;

  // Add pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const users = await User.aggregate(pipeline);

  const totalPages = Math.ceil(totalUsers / limit);

  successResponse(res, 200, 'Search results retrieved successfully', {
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
 * @route   GET /api/users/suggestions
 * @desc    Get connection suggestions
 * @access  Private
 */
router.get('/suggestions', authenticateToken, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const suggestions = await Connection.getConnectionSuggestions(req.user._id, limit);
  
  successResponse(res, 200, 'Connection suggestions retrieved successfully', {
    suggestions
  });
}));

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public (with privacy checks)
 */
router.get('/:id', authenticateOptionalToken, checkPrivacySettings('viewProfile'), asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id)
    .select('profile isVerified createdAt analytics')
    .populate('profile.experience')
    .populate('profile.education');

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Get connection status if authenticated
  let connectionStatus = 'not_connected';
  let mutualConnections = [];
  
  if (req.user && req.user._id.toString() !== id) {
    connectionStatus = await Connection.getConnectionStatus(req.user._id, id);
    mutualConnections = await Connection.findMutualConnections(req.user._id, id);
  }

  // Increment profile view count
  if (req.user && req.user._id.toString() !== id) {
    await User.findByIdAndUpdate(id, {
      $inc: { 'analytics.profileViews': 1 }
    });
  }

  successResponse(res, 200, 'User profile retrieved successfully', {
    user,
    connectionStatus,
    mutualConnections: mutualConnections.slice(0, 5) // Show only first 5
  });
}));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (Owner only)
 */
router.put('/:id', authenticateToken, requireOwnership('id'), validateProfileUpdate, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to update this profile'));
  }

  const updateData = req.body;
  
  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updateData.password;
  delete updateData.email;
  delete updateData.role;
  delete updateData.refreshTokens;

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-refreshTokens -emailVerificationToken -passwordResetToken');

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  successResponse(res, 200, 'Profile updated successfully', { user });
}));

/**
 * @route   POST /api/users/:id/upload-avatar
 * @desc    Upload profile picture
 * @access  Private (Owner only)
 */
router.post('/:id/upload-avatar', authenticateToken, requireOwnership('id'), upload.single('avatar'), asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to update this profile'));
  }

  if (!req.file) {
    return next(createError(400, 'No file uploaded'));
  }

  const avatarUrl = `/uploads/profiles/${req.file.filename}`;
  
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { 'profile.profilePicture': avatarUrl } },
    { new: true }
  ).select('profile.profilePicture');

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  successResponse(res, 200, 'Profile picture uploaded successfully', {
    profilePicture: user.profile.profilePicture
  });
}));

/**
 * @route   POST /api/users/:id/upload-cover
 * @desc    Upload cover photo
 * @access  Private (Owner only)
 */
router.post('/:id/upload-cover', authenticateToken, requireOwnership('id'), upload.single('cover'), asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to update this profile'));
  }

  if (!req.file) {
    return next(createError(400, 'No file uploaded'));
  }

  const coverUrl = `/uploads/profiles/${req.file.filename}`;
  
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { 'profile.coverPhoto': coverUrl } },
    { new: true }
  ).select('profile.coverPhoto');

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  successResponse(res, 200, 'Cover photo uploaded successfully', {
    coverPhoto: user.profile.coverPhoto
  });
}));

/**
 * @route   POST /api/users/:id/skills/:skillId/endorse
 * @desc    Endorse a user's skill
 * @access  Private
 */
router.post('/:id/skills/:skillId/endorse', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id, skillId } = req.params;
  const endorserId = req.user._id;

  if (id === endorserId.toString()) {
    return next(createError(400, 'You cannot endorse your own skills'));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  const skill = user.profile.skills.id(skillId);
  if (!skill) {
    return next(createError(404, 'Skill not found'));
  }

  // Check if already endorsed
  const existingEndorsement = skill.endorsements.find(
    endorsement => endorsement.user.toString() === endorserId.toString()
  );

  if (existingEndorsement) {
    return next(createError(400, 'You have already endorsed this skill'));
  }

  // Add endorsement
  skill.endorsements.push({
    user: endorserId,
    endorsedAt: new Date()
  });

  await user.save();

  successResponse(res, 200, 'Skill endorsed successfully');
}));

/**
 * @route   DELETE /api/users/:id/skills/:skillId/endorse
 * @desc    Remove endorsement from a user's skill
 * @access  Private
 */
router.delete('/:id/skills/:skillId/endorse', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id, skillId } = req.params;
  const endorserId = req.user._id;

  const user = await User.findById(id);
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  const skill = user.profile.skills.id(skillId);
  if (!skill) {
    return next(createError(404, 'Skill not found'));
  }

  // Remove endorsement
  skill.endorsements = skill.endorsements.filter(
    endorsement => endorsement.user.toString() !== endorserId.toString()
  );

  await user.save();

  successResponse(res, 200, 'Endorsement removed successfully');
}));

/**
 * @route   GET /api/users/:id/analytics
 * @desc    Get user analytics
 * @access  Private (Owner only)
 */
router.get('/:id/analytics', authenticateToken, requireOwnership('id'), asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to view this data'));
  }

  const user = await User.findById(id).select('analytics');
  
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Get additional analytics data
  const connectionCount = await Connection.countDocuments({
    $or: [
      { requester: id, status: 'accepted' },
      { recipient: id, status: 'accepted' }
    ]
  });

  const pendingConnectionRequests = await Connection.countDocuments({
    recipient: id,
    status: 'pending'
  });

  const analytics = {
    ...user.analytics.toObject(),
    connectionCount,
    pendingConnectionRequests
  };

  successResponse(res, 200, 'Analytics retrieved successfully', { analytics });
}));

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user account
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticateToken, requireOwnership('id'), asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to deactivate this account'));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { 
      isActive: false,
      refreshTokens: [] // Clear all sessions
    },
    { new: true }
  );

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  successResponse(res, 200, 'Account deactivated successfully');
}));

module.exports = router;

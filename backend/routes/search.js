const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Connection = require('../models/Connection');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { authenticateToken, authenticateOptionalToken: optionalAuth } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/search/global
 * @desc    Global search across users, posts, and jobs
 * @access  Public (with optional auth for personalization)
 */
router.get('/global', optionalAuth, validatePagination, asyncHandler(async (req, res, next) => {
  const { q: query, type = 'all', filter } = req.query;
  
  if (!query || query.trim().length < 2) {
    return next(createError(400, 'Search query must be at least 2 characters long'));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const searchResults = {
    users: [],
    posts: [],
    jobs: [],
    totalResults: 0
  };

  const searchRegex = { $regex: query, $options: 'i' };

  try {
    // Search Users
    if (type === 'all' || type === 'users') {
      const userQuery = {
        isActive: true,
        $or: [
          { 'profile.firstName': searchRegex },
          { 'profile.lastName': searchRegex },
          { 'profile.headline': searchRegex },
          { 'profile.location': searchRegex },
          { 'profile.industry': searchRegex },
          { 'profile.skills': searchRegex },
          { company: searchRegex }
        ]
      };

      // Apply filters
      if (filter) {
        const filters = JSON.parse(filter);
        if (filters.location) {
          userQuery['profile.location'] = { $regex: filters.location, $options: 'i' };
        }
        if (filters.industry) {
          userQuery['profile.industry'] = { $regex: filters.industry, $options: 'i' };
        }
        if (filters.company) {
          userQuery.company = { $regex: filters.company, $options: 'i' };
        }
      }

      const users = await User.find(userQuery)
        .select('profile.firstName profile.lastName profile.profilePicture profile.headline profile.location profile.industry profile.connectionCount company')
        .sort({ 'profile.connectionCount': -1, createdAt: -1 })
        .limit(type === 'users' ? limit : 10)
        .lean();

      // Add mutual connections if user is authenticated
      if (req.user) {
        for (let user of users) {
          const mutualConnections = await Connection.findMutualConnections(req.user._id, user._id);
          user.mutualConnectionCount = mutualConnections.length;
        }
      }

      searchResults.users = users;
    }

    // Search Posts
    if (type === 'all' || type === 'posts') {
      const postQuery = {
        privacy: { $in: ['public', 'connections'] },
        $or: [
          { content: searchRegex },
          { 'media.caption': searchRegex }
        ]
      };

      const posts = await Post.find(postQuery)
        .populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline')
        .select('-comments.replies') // Exclude nested replies for performance
        .sort({ createdAt: -1, likeCount: -1 })
        .limit(type === 'posts' ? limit : 10)
        .lean();

      searchResults.posts = posts;
    }

    // Search Jobs
    if (type === 'all' || type === 'jobs') {
      const jobQuery = {
        status: 'active',
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { company: searchRegex },
          { 'requirements.skills': searchRegex }
        ]
      };

      // Apply job-specific filters
      if (filter) {
        const filters = JSON.parse(filter);
        if (filters.jobType) {
          jobQuery.jobType = { $in: filters.jobType };
        }
        if (filters.workArrangement) {
          jobQuery.workArrangement = { $in: filters.workArrangement };
        }
        if (filters.experienceLevel) {
          jobQuery.experienceLevel = { $in: filters.experienceLevel };
        }
        if (filters.location) {
          jobQuery.$or = [
            { 'location.city': { $regex: filters.location, $options: 'i' } },
            { 'location.state': { $regex: filters.location, $options: 'i' } },
            { 'location.country': { $regex: filters.location, $options: 'i' } }
          ];
        }
        if (filters.minSalary) {
          jobQuery['salary.min'] = { $gte: parseInt(filters.minSalary) };
        }
        if (filters.maxSalary) {
          jobQuery['salary.max'] = { $lte: parseInt(filters.maxSalary) };
        }
      }

      const jobs = await Job.find(jobQuery)
        .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company')
        .select('-applications -analytics.viewHistory')
        .sort({ createdAt: -1, applicationCount: -1 })
        .limit(type === 'jobs' ? limit : 10)
        .lean();

      searchResults.jobs = jobs;
    }

    // Calculate total results
    searchResults.totalResults = searchResults.users.length + 
                                 searchResults.posts.length + 
                                 searchResults.jobs.length;

    // If searching specific type, implement pagination
    if (type !== 'all') {
      const totalPages = Math.ceil(searchResults.totalResults / limit);
      searchResults.pagination = {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      };
    }

    successResponse(res, 200, 'Search results retrieved successfully', searchResults);
  } catch (error) {
    next(createError(500, 'Search failed'));
  }
}));

/**
 * @route   GET /api/search/users
 * @desc    Search users with advanced filters
 * @access  Public (with optional auth for mutual connections)
 */
router.get('/users', optionalAuth, validatePagination, asyncHandler(async (req, res, next) => {
  const { q: query } = req.query;
  
  if (!query || query.trim().length < 2) {
    return next(createError(400, 'Search query must be at least 2 characters long'));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const searchQuery = {
    isActive: true,
    $or: [
      { 'profile.firstName': { $regex: query, $options: 'i' } },
      { 'profile.lastName': { $regex: query, $options: 'i' } },
      { 'profile.headline': { $regex: query, $options: 'i' } },
      { 'profile.location': { $regex: query, $options: 'i' } },
      { 'profile.industry': { $regex: query, $options: 'i' } },
      { 'profile.skills': { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } }
    ]
  };

  // Advanced filters
  if (req.query.location) {
    searchQuery['profile.location'] = { $regex: req.query.location, $options: 'i' };
  }
  if (req.query.industry) {
    searchQuery['profile.industry'] = { $regex: req.query.industry, $options: 'i' };
  }
  if (req.query.company) {
    searchQuery.company = { $regex: req.query.company, $options: 'i' };
  }
  if (req.query.skills) {
    const skills = req.query.skills.split(',');
    searchQuery['profile.skills'] = { $in: skills.map(skill => new RegExp(skill, 'i')) };
  }

  // Exclude current user from results if authenticated
  if (req.user) {
    searchQuery._id = { $ne: req.user._id };
  }

  const totalUsers = await User.countDocuments(searchQuery);

  let users = await User.find(searchQuery)
    .select('profile.firstName profile.lastName profile.profilePicture profile.headline profile.location profile.industry profile.connectionCount profile.skills company createdAt')
    .sort({ 'profile.connectionCount': -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Add connection status and mutual connections if user is authenticated
  if (req.user) {
    for (let user of users) {
      // Check connection status
      const connection = await Connection.findOne({
        $or: [
          { requester: req.user._id, recipient: user._id },
          { requester: user._id, recipient: req.user._id }
        ]
      });

      if (connection) {
        user.connectionStatus = connection.status;
        user.isRequester = connection.requester.toString() === req.user._id.toString();
      } else {
        user.connectionStatus = 'none';
      }

      // Get mutual connections
      const mutualConnections = await Connection.findMutualConnections(req.user._id, user._id);
      user.mutualConnections = mutualConnections.slice(0, 3); // Show up to 3 mutual connections
      user.mutualConnectionCount = mutualConnections.length;
    }
  }

  const totalPages = Math.ceil(totalUsers / limit);

  successResponse(res, 200, 'Users search results retrieved successfully', {
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
 * @route   GET /api/search/posts
 * @desc    Search posts with content filtering
 * @access  Public
 */
router.get('/posts', validatePagination, asyncHandler(async (req, res, next) => {
  const { q: query } = req.query;
  
  if (!query || query.trim().length < 2) {
    return next(createError(400, 'Search query must be at least 2 characters long'));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const searchQuery = {
    privacy: { $in: ['public', 'connections'] },
    $or: [
      { content: { $regex: query, $options: 'i' } },
      { 'media.caption': { $regex: query, $options: 'i' } }
    ]
  };

  // Filter by post type
  if (req.query.type) {
    searchQuery.type = req.query.type;
  }

  // Filter by date range
  if (req.query.dateFrom || req.query.dateTo) {
    searchQuery.createdAt = {};
    if (req.query.dateFrom) {
      searchQuery.createdAt.$gte = new Date(req.query.dateFrom);
    }
    if (req.query.dateTo) {
      searchQuery.createdAt.$lte = new Date(req.query.dateTo);
    }
  }

  const totalPosts = await Post.countDocuments(searchQuery);

  const posts = await Post.find(searchQuery)
    .populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline')
    .populate('likes', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('shares.user', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('comments.author', 'profile.firstName profile.lastName profile.profilePicture')
    .sort({ 
      [req.query.sortBy === 'engagement' ? 'engagementScore' : 'createdAt']: -1 
    })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalPosts / limit);

  successResponse(res, 200, 'Posts search results retrieved successfully', {
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/search/jobs
 * @desc    Search jobs with comprehensive filters
 * @access  Public
 */
router.get('/jobs', validatePagination, asyncHandler(async (req, res, next) => {
  const { q: query } = req.query;
  
  if (!query || query.trim().length < 2) {
    return next(createError(400, 'Search query must be at least 2 characters long'));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const searchQuery = {
    status: 'active',
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } },
      { 'requirements.skills': { $regex: query, $options: 'i' } }
    ]
  };

  // Location filter
  if (req.query.location) {
    searchQuery.$and = [
      searchQuery.$or ? { $or: searchQuery.$or } : {},
      {
        $or: [
          { 'location.city': { $regex: req.query.location, $options: 'i' } },
          { 'location.state': { $regex: req.query.location, $options: 'i' } },
          { 'location.country': { $regex: req.query.location, $options: 'i' } }
        ]
      }
    ];
    delete searchQuery.$or;
  }

  // Job type filter
  if (req.query.jobType) {
    const jobTypes = req.query.jobType.split(',');
    searchQuery.jobType = { $in: jobTypes };
  }

  // Work arrangement filter
  if (req.query.workArrangement) {
    const arrangements = req.query.workArrangement.split(',');
    searchQuery.workArrangement = { $in: arrangements };
  }

  // Experience level filter
  if (req.query.experienceLevel) {
    const levels = req.query.experienceLevel.split(',');
    searchQuery.experienceLevel = { $in: levels };
  }

  // Industry filter
  if (req.query.industry) {
    const industries = req.query.industry.split(',');
    searchQuery.industry = { $in: industries };
  }

  // Salary range filter
  if (req.query.minSalary || req.query.maxSalary) {
    if (req.query.minSalary) {
      searchQuery['salary.min'] = { $gte: parseInt(req.query.minSalary) };
    }
    if (req.query.maxSalary) {
      searchQuery['salary.max'] = { $lte: parseInt(req.query.maxSalary) };
    }
  }

  // Skills filter
  if (req.query.skills) {
    const skills = req.query.skills.split(',');
    searchQuery['requirements.skills'] = { $in: skills.map(skill => new RegExp(skill, 'i')) };
  }

  // Date posted filter
  if (req.query.postedSince) {
    const daysAgo = parseInt(req.query.postedSince);
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysAgo);
    searchQuery.createdAt = { $gte: sinceDate };
  }

  // Company filter
  if (req.query.company) {
    searchQuery.company = { $regex: req.query.company, $options: 'i' };
  }

  const totalJobs = await Job.countDocuments(searchQuery);

  // Sort options
  let sortOptions = { createdAt: -1 };
  switch (req.query.sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'salaryHigh':
      sortOptions = { 'salary.max': -1, createdAt: -1 };
      break;
    case 'salaryLow':
      sortOptions = { 'salary.min': 1, createdAt: -1 };
      break;
    case 'applications':
      sortOptions = { applicationCount: -1, createdAt: -1 };
      break;
    case 'relevance':
    default:
      sortOptions = { createdAt: -1 };
  }

  const jobs = await Job.find(searchQuery)
    .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company')
    .select('-applications -analytics.viewHistory')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalJobs / limit);

  successResponse(res, 200, 'Jobs search results retrieved successfully', {
    jobs,
    pagination: {
      currentPage: page,
      totalPages,
      totalJobs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions/autocomplete
 * @access  Public
 */
router.get('/suggestions', asyncHandler(async (req, res, next) => {
  const { q: query, type = 'all' } = req.query;
  
  if (!query || query.trim().length < 2) {
    return successResponse(res, 200, 'Search suggestions retrieved successfully', {
      suggestions: []
    });
  }

  const suggestions = [];
  const searchRegex = { $regex: query, $options: 'i' };
  const limit = 10;

  try {
    if (type === 'all' || type === 'users') {
      // User suggestions
      const userSuggestions = await User.find({
        isActive: true,
        $or: [
          { 'profile.firstName': searchRegex },
          { 'profile.lastName': searchRegex },
          { 'profile.headline': searchRegex }
        ]
      })
      .select('profile.firstName profile.lastName profile.headline profile.profilePicture')
      .limit(limit)
      .lean();

      userSuggestions.forEach(user => {
        suggestions.push({
          type: 'user',
          text: `${user.profile.firstName} ${user.profile.lastName}`,
          subtitle: user.profile.headline,
          avatar: user.profile.profilePicture,
          id: user._id
        });
      });
    }

    if (type === 'all' || type === 'companies') {
      // Company suggestions
      const companySuggestions = await User.distinct('company', {
        company: searchRegex,
        company: { $ne: null }
      }).limit(limit);

      companySuggestions.forEach(company => {
        suggestions.push({
          type: 'company',
          text: company,
          subtitle: 'Company'
        });
      });
    }

    if (type === 'all' || type === 'skills') {
      // Skills suggestions
      const skillSuggestions = await User.distinct('profile.skills', {
        'profile.skills': searchRegex
      }).limit(limit);

      skillSuggestions.forEach(skill => {
        suggestions.push({
          type: 'skill',
          text: skill,
          subtitle: 'Skill'
        });
      });
    }

    if (type === 'all' || type === 'locations') {
      // Location suggestions
      const locationSuggestions = await User.distinct('profile.location', {
        'profile.location': searchRegex,
        'profile.location': { $ne: null }
      }).limit(limit);

      locationSuggestions.forEach(location => {
        suggestions.push({
          type: 'location',
          text: location,
          subtitle: 'Location'
        });
      });
    }

    if (type === 'all' || type === 'jobs') {
      // Job title suggestions
      const jobTitleSuggestions = await Job.distinct('title', {
        status: 'active',
        title: searchRegex
      }).limit(limit);

      jobTitleSuggestions.forEach(title => {
        suggestions.push({
          type: 'job_title',
          text: title,
          subtitle: 'Job Title'
        });
      });
    }

    // Remove duplicates and limit total results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
      )
      .slice(0, 20);

    successResponse(res, 200, 'Search suggestions retrieved successfully', {
      suggestions: uniqueSuggestions
    });
  } catch (error) {
    successResponse(res, 200, 'Search suggestions retrieved successfully', {
      suggestions: []
    });
  }
}));

/**
 * @route   GET /api/search/trending
 * @desc    Get trending searches and topics
 * @access  Public
 */
router.get('/trending', asyncHandler(async (req, res) => {
  const trending = {
    hashtags: [],
    skills: [],
    companies: [],
    jobTitles: [],
    locations: []
  };

  try {
    // Get trending hashtags from posts (simplified - would use analytics in production)
    const recentPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      privacy: 'public'
    })
    .select('content')
    .limit(1000)
    .lean();

    const hashtagCount = {};
    recentPosts.forEach(post => {
      const hashtags = post.content.match(/#[\w]+/g) || [];
      hashtags.forEach(tag => {
        const cleanTag = tag.toLowerCase();
        hashtagCount[cleanTag] = (hashtagCount[cleanTag] || 0) + 1;
      });
    });

    trending.hashtags = Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Get trending skills (most mentioned in recent user profiles)
    const skillCounts = await User.aggregate([
      { $match: { isActive: true, 'profile.skills': { $exists: true, $ne: [] } } },
      { $unwind: '$profile.skills' },
      { $group: { _id: '$profile.skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    trending.skills = skillCounts.map(skill => ({
      name: skill._id,
      count: skill.count
    }));

    // Get trending companies
    const companyCounts = await User.aggregate([
      { $match: { isActive: true, company: { $exists: true, $ne: null } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    trending.companies = companyCounts.map(company => ({
      name: company._id,
      count: company.count
    }));

    // Get trending job titles (from active jobs)
    const jobTitleCounts = await Job.aggregate([
      { $match: { status: 'active', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$title', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    trending.jobTitles = jobTitleCounts.map(job => ({
      title: job._id,
      count: job.count
    }));

    successResponse(res, 200, 'Trending topics retrieved successfully', trending);
  } catch (error) {
    successResponse(res, 200, 'Trending topics retrieved successfully', trending);
  }
}));

module.exports = router;

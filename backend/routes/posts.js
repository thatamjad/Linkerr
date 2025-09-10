const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { validatePostCreation, validateCommentCreation, validatePagination } = require('../middleware/validation');
const { authenticateToken, authenticateOptionalToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/posts/';
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'documents/';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/quicktime',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const mimetype = allowedMimes.includes(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

/**
 * @route   GET /api/posts
 * @desc    Get posts with pagination and filtering
 * @access  Public
 */
router.get('/', validatePagination, authenticateOptionalToken, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const type = req.query.type;
  const author = req.query.author;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Build query
  const query = { isBlocked: false };
  
  // Add visibility filter based on authentication
  if (req.user) {
    query.$or = [
      { visibility: 'public' },
      { author: req.user._id }, // User's own posts
      { 
        visibility: 'connections',
        // This would need connection check - simplified for now
      },
      {
        visibility: 'followers',
        // This would need follower check - simplified for now
      }
    ];
  } else {
    query.visibility = 'public';
  }

  if (type) {
    query.type = type;
  }

  if (author) {
    query.author = author;
  }

  const totalPosts = await Post.countDocuments(query);
  
  const posts = await Post.find(query)
    .populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline')
    .populate('likes.user', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('comments.author', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('originalPost')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  // Add user interaction status if authenticated
  if (req.user) {
    posts.forEach(post => {
      post.isLikedByUser = post.likes.some(like => like.user._id.toString() === req.user._id.toString());
      post.isBookmarkedByUser = post.bookmarks?.some(bookmark => bookmark.user.toString() === req.user._id.toString());
    });
  }

  const totalPages = Math.ceil(totalPosts / limit);

  successResponse(res, 200, 'Posts retrieved successfully', {
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
 * @route   GET /api/posts/feed
 * @desc    Get personalized feed
 * @access  Private
 */
router.get('/feed', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Get user's connections for feed filtering
  const user = await User.findById(req.user._id).populate('connections.user', '_id');
  const connectionIds = user.connections
    .filter(conn => conn.status === 'accepted')
    .map(conn => conn.user._id);

  // Include user's own posts and connections' posts
  const feedUserIds = [req.user._id, ...connectionIds];

  const query = {
    $or: [
      { author: { $in: feedUserIds }, visibility: { $in: ['public', 'connections'] } },
      { visibility: 'public', isPromoted: true } // Include promoted posts
    ],
    isBlocked: false
  };

  const totalPosts = await Post.countDocuments(query);
  
  const posts = await Post.find(query)
    .populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline')
    .populate('likes.user', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('comments.author', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('originalPost')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Add user interaction status
  posts.forEach(post => {
    post.isLikedByUser = post.likes.some(like => like.user._id.toString() === req.user._id.toString());
    post.isBookmarkedByUser = post.bookmarks?.some(bookmark => bookmark.user.toString() === req.user._id.toString());
  });

  const totalPages = Math.ceil(totalPosts / limit);

  successResponse(res, 200, 'Feed retrieved successfully', {
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
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', authenticateToken, upload.array('media', 10), validatePostCreation, asyncHandler(async (req, res, next) => {
  const postData = {
    ...req.body,
    author: req.user._id
  };

  // Handle file uploads
  if (req.files && req.files.length > 0) {
    postData.media = req.files.map(file => {
      let type = 'document';
      if (file.mimetype.startsWith('image/')) type = 'image';
      else if (file.mimetype.startsWith('video/')) type = 'video';

      return {
        type,
        url: `/uploads/posts/${type}s/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      };
    });
  }

  // Handle poll data
  if (postData.type === 'poll' && postData.poll) {
    if (typeof postData.poll === 'string') {
      postData.poll = JSON.parse(postData.poll);
    }
  }

  // Handle event data
  if (postData.type === 'event' && postData.event) {
    if (typeof postData.event === 'string') {
      postData.event = JSON.parse(postData.event);
    }
  }

  const post = new Post(postData);
  await post.save();

  // Populate author information
  await post.populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline');

  // TODO: Send notifications to connections if visibility allows
  // TODO: Send to real-time feed updates

  successResponse(res, 201, 'Post created successfully', { post });
}));

/**
 * @route   GET /api/posts/:id
 * @desc    Get post by ID
 * @access  Public
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id)
    .populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline')
    .populate('likes.user', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('comments.author', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('comments.replies.author', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('originalPost');

  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check visibility permissions
  if (post.visibility !== 'public' && (!req.user || req.user._id.toString() !== post.author._id.toString())) {
    return next(createError(403, 'Access denied'));
  }

  // Record view if authenticated and not the author
  if (req.user && req.user._id.toString() !== post.author._id.toString()) {
    // Check if user hasn't viewed this post recently
    const recentView = post.views.find(
      view => view.user.toString() === req.user._id.toString() &&
      (Date.now() - view.viewedAt.getTime()) < 24 * 60 * 60 * 1000 // 24 hours
    );

    if (!recentView) {
      post.views.push({
        user: req.user._id,
        viewedAt: new Date()
      });
      await post.save();
    }
  }

  // Add user interaction status
  if (req.user) {
    post.isLikedByUser = post.isLikedBy(req.user._id);
    post.isBookmarkedByUser = post.isBookmarkedBy(req.user._id);
  }

  successResponse(res, 200, 'Post retrieved successfully', { post });
}));

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post
 * @access  Private (Author only)
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to update this post'));
  }

  // Store original content for edit history
  if (post.content !== req.body.content) {
    post.editHistory.push({
      content: post.content,
      editedAt: new Date()
    });
    post.isEdited = true;
  }

  // Update allowed fields
  const allowedUpdates = ['content', 'visibility', 'tags'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });

  await post.save();

  successResponse(res, 200, 'Post updated successfully', { post });
}));

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private (Author only)
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(createError(403, 'Not authorized to delete this post'));
  }

  await Post.findByIdAndDelete(id);

  successResponse(res, 200, 'Post deleted successfully');
}));

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like/unlike post
 * @access  Private
 */
router.post('/:id/like', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { type = 'like' } = req.body; // like, love, celebrate, support, insightful, funny
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  const existingLikeIndex = post.likes.findIndex(
    like => like.user.toString() === req.user._id.toString()
  );

  if (existingLikeIndex > -1) {
    // Toggle like or update type
    if (post.likes[existingLikeIndex].type === type) {
      // Remove like
      post.likes.splice(existingLikeIndex, 1);
    } else {
      // Update like type
      post.likes[existingLikeIndex].type = type;
      post.likes[existingLikeIndex].likedAt = new Date();
    }
  } else {
    // Add new like
    post.likes.push({
      user: req.user._id,
      type,
      likedAt: new Date()
    });

    // Create notification for post author (if not self-like)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'post_like',
        title: 'New Like',
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} liked your post`,
        relatedPost: post._id,
        data: { likeType: type }
      });
    }
  }

  await post.save();

  successResponse(res, 200, 'Post like updated successfully', {
    likesCount: post.likes.length,
    isLiked: post.isLikedBy(req.user._id),
    userLikeType: post.likes.find(like => like.user.toString() === req.user._id.toString())?.type
  });
}));

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add comment to post
 * @access  Private
 */
router.post('/:id/comments', authenticateToken, validateCommentCreation, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  const comment = {
    author: req.user._id,
    content,
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();

  // Populate the new comment
  await post.populate('comments.author', 'profile.firstName profile.lastName profile.profilePicture');

  const newComment = post.comments[post.comments.length - 1];

  // TODO: Create notification for post author
  // TODO: Send real-time update

  successResponse(res, 201, 'Comment added successfully', { comment: newComment });
}));

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add comment to post (alias for singular form)
 * @access  Private
 */
router.post('/:id/comment', authenticateToken, validateCommentCreation, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  const comment = {
    author: req.user._id,
    content,
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();

  // Populate the new comment
  await post.populate('comments.author', 'profile.firstName profile.lastName profile.profilePicture');

  const newComment = post.comments[post.comments.length - 1];

  // TODO: Create notification for post author
  // TODO: Send real-time update

  successResponse(res, 201, 'Comment added successfully', newComment);
}));

/**
 * @route   POST /api/posts/:id/comments/:commentId/reply
 * @desc    Reply to comment
 * @access  Private
 */
router.post('/:id/comments/:commentId/reply', authenticateToken, validateCommentCreation, asyncHandler(async (req, res, next) => {
  const { id, commentId } = req.params;
  const { content } = req.body;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  const comment = post.comments.id(commentId);
  
  if (!comment) {
    return next(createError(404, 'Comment not found'));
  }

  const reply = {
    author: req.user._id,
    content,
    createdAt: new Date()
  };

  comment.replies.push(reply);
  await post.save();

  // Populate the new reply
  await post.populate('comments.replies.author', 'profile.firstName profile.lastName profile.profilePicture');

  const newReply = comment.replies[comment.replies.length - 1];

  // Create notification for comment author (if not self-reply)
  if (comment.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: comment.author,
      sender: req.user._id,
      type: 'post_comment',
      title: 'New Reply',
      message: `${req.user.profile.firstName} ${req.user.profile.lastName} replied to your comment`,
      relatedPost: post._id,
      data: { commentId, replyId: newReply._id }
    });
  }

  successResponse(res, 201, 'Reply added successfully', { reply: newReply });
}));

/**
 * @route   POST /api/posts/:id/share
 * @desc    Share post
 * @access  Private
 */
router.post('/:id/share', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;
  
  const originalPost = await Post.findById(id);
  
  if (!originalPost) {
    return next(createError(404, 'Post not found'));
  }

  // Create share record
  const shareRecord = {
    user: req.user._id,
    comment: comment || '',
    sharedAt: new Date()
  };

  originalPost.shares.push(shareRecord);
  await originalPost.save();

  // Create a new post that shares the original
  const sharePost = new Post({
    author: req.user._id,
    content: comment || '',
    type: 'share',
    originalPost: originalPost._id,
    visibility: req.body.visibility || 'public'
  });

  await sharePost.save();
  await sharePost.populate('author', 'profile.firstName profile.lastName profile.profilePicture profile.headline');
  await sharePost.populate('originalPost');

  // Create notification for original post author (if not self-share)
  if (originalPost.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: originalPost.author,
      sender: req.user._id,
      type: 'post_share',
      title: 'Post Shared',
      message: `${req.user.profile.firstName} ${req.user.profile.lastName} shared your post`,
      relatedPost: originalPost._id,
      data: { sharePostId: sharePost._id }
    });
  }

  successResponse(res, 201, 'Post shared successfully', { 
    sharePost,
    shareCount: originalPost.shares.length
  });
}));

/**
 * @route   POST /api/posts/:id/bookmark
 * @desc    Bookmark/unbookmark post
 * @access  Private
 */
router.post('/:id/bookmark', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  const existingBookmarkIndex = post.bookmarks.findIndex(
    bookmark => bookmark.user.toString() === req.user._id.toString()
  );

  if (existingBookmarkIndex > -1) {
    // Remove bookmark
    post.bookmarks.splice(existingBookmarkIndex, 1);
  } else {
    // Add bookmark
    post.bookmarks.push({
      user: req.user._id,
      bookmarkedAt: new Date()
    });
  }

  await post.save();

  successResponse(res, 200, 'Bookmark status updated successfully', {
    isBookmarked: post.isBookmarkedBy(req.user._id)
  });
}));

/**
 * @route   POST /api/posts/:id/report
 * @desc    Report post
 * @access  Private
 */
router.post('/:id/report', authenticateToken, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason, description } = req.body;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return next(createError(404, 'Post not found'));
  }

  // Check if user has already reported this post
  const existingReport = post.reportedBy.find(
    report => report.user.toString() === req.user._id.toString()
  );

  if (existingReport) {
    return next(createError(400, 'You have already reported this post'));
  }

  post.reportedBy.push({
    user: req.user._id,
    reason,
    description,
    reportedAt: new Date()
  });

  await post.save();

  successResponse(res, 200, 'Post reported successfully');
}));

module.exports = router;

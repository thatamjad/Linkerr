const express = require('express');
const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { validateConnectionRequest, validatePagination } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/connections
 * @desc    Get user's connections
 * @access  Private
 */
router.get('/', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status || 'accepted';
  const search = req.query.search || '';

  // Build query for connections where user is either requester or recipient
  const baseQuery = {
    $or: [
      { requester: req.user._id },
      { recipient: req.user._id }
    ],
    status
  };

  // Get total count
  const totalConnections = await Connection.countDocuments(baseQuery);

  // Get connections with populated user data
  let connections = await Connection.find(baseQuery)
    .populate('requester', 'profile.firstName profile.lastName profile.profilePicture profile.headline profile.location profile.industry')
    .populate('recipient', 'profile.firstName profile.lastName profile.profilePicture profile.headline profile.location profile.industry')
    .populate('mutualConnections', 'profile.firstName profile.lastName profile.profilePicture')
    .sort({ [status === 'pending' ? 'requestedAt' : 'respondedAt']: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Transform connections to show the "other" user and include connection metadata
  connections = connections.map(connection => {
    const isRequester = connection.requester._id.toString() === req.user._id.toString();
    const otherUser = isRequester ? connection.recipient : connection.requester;
    
    return {
      connectionId: connection._id,
      user: otherUser,
      status: connection.status,
      connectedAt: connection.respondedAt || connection.requestedAt,
      message: connection.message,
      note: connection.note,
      mutualConnections: connection.mutualConnections,
      mutualConnectionCount: connection.mutualConnections?.length || 0,
      connectionSource: connection.connectionSource,
      strength: connection.strength,
      lastInteraction: connection.lastInteraction,
      interactionCount: connection.interactionCount,
      isRequester,
      tags: connection.tags
    };
  });

  // Apply search filter if provided
  if (search) {
    connections = connections.filter(conn => {
      const user = conn.user;
      const fullName = `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase();
      const headline = (user.profile.headline || '').toLowerCase();
      const location = (user.profile.location || '').toLowerCase();
      const industry = (user.profile.industry || '').toLowerCase();
      
      return fullName.includes(search.toLowerCase()) ||
             headline.includes(search.toLowerCase()) ||
             location.includes(search.toLowerCase()) ||
             industry.includes(search.toLowerCase());
    });
  }

  const totalPages = Math.ceil(totalConnections / limit);

  successResponse(res, 200, 'Connections retrieved successfully', {
    connections,
    pagination: {
      currentPage: page,
      totalPages,
      totalConnections,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/connections/requests
 * @desc    Get pending connection requests (received)
 * @access  Private
 */
router.get('/requests', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    recipient: req.user._id,
    status: 'pending'
  };

  const totalRequests = await Connection.countDocuments(query);

  const requests = await Connection.find(query)
    .populate('requester', 'profile.firstName profile.lastName profile.profilePicture profile.headline profile.location profile.industry')
    .populate('mutualConnections', 'profile.firstName profile.lastName profile.profilePicture')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedRequests = requests.map(request => ({
    requestId: request._id,
    user: request.requester,
    message: request.message,
    requestedAt: request.requestedAt,
    mutualConnections: request.mutualConnections,
    mutualConnectionCount: request.mutualConnections?.length || 0,
    connectionSource: request.connectionSource
  }));

  const totalPages = Math.ceil(totalRequests / limit);

  successResponse(res, 200, 'Connection requests retrieved successfully', {
    requests: formattedRequests,
    pagination: {
      currentPage: page,
      totalPages,
      totalRequests,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/connections/sent
 * @desc    Get sent connection requests
 * @access  Private
 */
router.get('/sent', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    requester: req.user._id,
    status: 'pending'
  };

  const totalSent = await Connection.countDocuments(query);

  const sentRequests = await Connection.find(query)
    .populate('recipient', 'profile.firstName profile.lastName profile.profilePicture profile.headline profile.location profile.industry')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedRequests = sentRequests.map(request => ({
    requestId: request._id,
    user: request.recipient,
    message: request.message,
    requestedAt: request.requestedAt,
    connectionSource: request.connectionSource
  }));

  const totalPages = Math.ceil(totalSent / limit);

  successResponse(res, 200, 'Sent requests retrieved successfully', {
    requests: formattedRequests,
    pagination: {
      currentPage: page,
      totalPages,
      totalSent,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/connections/suggestions
 * @desc    Get connection suggestions
 * @access  Private
 */
router.get('/suggestions', authenticateToken, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const suggestions = await Connection.getConnectionSuggestions(req.user._id, limit);
    
    successResponse(res, 200, 'Connection suggestions retrieved successfully', {
      suggestions
    });
  } catch (error) {
    successResponse(res, 200, 'Connection suggestions retrieved successfully', {
      suggestions: [] // Return empty array if suggestion algorithm fails
    });
  }
}));

/**
 * @route   POST /api/connections/connect/:userId
 * @desc    Send connection request
 * @access  Private
 */
router.post('/connect/:userId', authenticateToken, validateConnectionRequest, asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { message, source = 'other' } = req.body;

  // Check if trying to connect to self
  if (userId === req.user._id.toString()) {
    return next(createError(400, 'Cannot send connection request to yourself'));
  }

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(createError(404, 'User not found'));
  }

  if (!targetUser.isActive) {
    return next(createError(400, 'Cannot connect to inactive user'));
  }

  // Check if connection already exists
  const existingConnection = await Connection.findOne({
    $or: [
      { requester: req.user._id, recipient: userId },
      { requester: userId, recipient: req.user._id }
    ]
  });

  if (existingConnection) {
    let statusMessage = 'Connection already exists';
    switch (existingConnection.status) {
      case 'pending':
        statusMessage = existingConnection.requester.toString() === req.user._id.toString() 
          ? 'Connection request already sent' 
          : 'Connection request already received from this user';
        break;
      case 'accepted':
        statusMessage = 'Already connected to this user';
        break;
      case 'declined':
        statusMessage = 'Previous connection request was declined';
        break;
      case 'blocked':
        statusMessage = 'Cannot connect to this user';
        break;
    }
    return next(createError(400, statusMessage));
  }

  // Get mutual connections
  const mutualConnections = await Connection.findMutualConnections(req.user._id, userId);

  // Create connection request
  const connectionRequest = new Connection({
    requester: req.user._id,
    recipient: userId,
    message: message || '',
    connectionSource: source,
    mutualConnections: mutualConnections.slice(0, 10).map(conn => conn._id), // Store up to 10 mutual connections
    requestedAt: new Date()
  });

  await connectionRequest.save();

  // Create notification for recipient
  await Notification.createNotification({
    recipient: userId,
    sender: req.user._id,
    type: 'connection_request',
    title: 'New Connection Request',
    message: `${req.user.profile.firstName} ${req.user.profile.lastName} wants to connect with you`,
    relatedConnection: connectionRequest._id,
    data: {
      message,
      mutualConnectionCount: mutualConnections.length
    },
    actionRequired: true,
    actions: [
      {
        label: 'Accept',
        type: 'accept',
        url: `/api/connections/accept/${connectionRequest._id}`
      },
      {
        label: 'Decline',
        type: 'decline',
        url: `/api/connections/decline/${connectionRequest._id}`
      }
    ]
  });

  successResponse(res, 201, 'Connection request sent successfully', {
    connectionRequest: {
      id: connectionRequest._id,
      recipient: targetUser.profile.firstName + ' ' + targetUser.profile.lastName,
      status: connectionRequest.status,
      requestedAt: connectionRequest.requestedAt,
      mutualConnectionCount: mutualConnections.length
    }
  });
}));

/**
 * @route   POST /api/connections/accept/:requestId
 * @desc    Accept connection request
 * @access  Private
 */
router.post('/accept/:requestId', authenticateToken, asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { note } = req.body;

  const connectionRequest = await Connection.findById(requestId)
    .populate('requester', 'profile.firstName profile.lastName profile.profilePicture');

  if (!connectionRequest) {
    return next(createError(404, 'Connection request not found'));
  }

  // Check if current user is the recipient
  if (connectionRequest.recipient.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to accept this connection request'));
  }

  if (connectionRequest.status !== 'pending') {
    return next(createError(400, 'Connection request is no longer pending'));
  }

  // Update connection status
  connectionRequest.status = 'accepted';
  connectionRequest.respondedAt = new Date();
  if (note) {
    connectionRequest.note = note;
  }

  await connectionRequest.save();

  // Create notification for requester
  await Notification.createNotification({
    recipient: connectionRequest.requester._id,
    sender: req.user._id,
    type: 'connection_accepted',
    title: 'Connection Accepted',
    message: `${req.user.profile.firstName} ${req.user.profile.lastName} accepted your connection request`,
    relatedConnection: connectionRequest._id,
    data: { note }
  });

  successResponse(res, 200, 'Connection request accepted successfully', {
    connection: {
      id: connectionRequest._id,
      user: connectionRequest.requester,
      status: connectionRequest.status,
      connectedAt: connectionRequest.respondedAt,
      note: connectionRequest.note
    }
  });
}));

/**
 * @route   POST /api/connections/decline/:requestId
 * @desc    Decline connection request
 * @access  Private
 */
router.post('/decline/:requestId', authenticateToken, asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;

  const connectionRequest = await Connection.findById(requestId);

  if (!connectionRequest) {
    return next(createError(404, 'Connection request not found'));
  }

  // Check if current user is the recipient
  if (connectionRequest.recipient.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to decline this connection request'));
  }

  if (connectionRequest.status !== 'pending') {
    return next(createError(400, 'Connection request is no longer pending'));
  }

  // Update connection status
  connectionRequest.status = 'declined';
  connectionRequest.respondedAt = new Date();

  await connectionRequest.save();

  successResponse(res, 200, 'Connection request declined successfully');
}));

/**
 * @route   DELETE /api/connections/:connectionId
 * @desc    Remove connection
 * @access  Private
 */
router.delete('/:connectionId', authenticateToken, asyncHandler(async (req, res, next) => {
  const { connectionId } = req.params;

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return next(createError(404, 'Connection not found'));
  }

  // Check if current user is part of this connection
  const isRequester = connection.requester.toString() === req.user._id.toString();
  const isRecipient = connection.recipient.toString() === req.user._id.toString();

  if (!isRequester && !isRecipient) {
    return next(createError(403, 'Not authorized to remove this connection'));
  }

  await Connection.findByIdAndDelete(connectionId);

  successResponse(res, 200, 'Connection removed successfully');
}));

/**
 * @route   POST /api/connections/:connectionId/block
 * @desc    Block user (from connection)
 * @access  Private
 */
router.post('/:connectionId/block', authenticateToken, asyncHandler(async (req, res, next) => {
  const { connectionId } = req.params;

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return next(createError(404, 'Connection not found'));
  }

  // Check if current user is part of this connection
  const isRequester = connection.requester.toString() === req.user._id.toString();
  const isRecipient = connection.recipient.toString() === req.user._id.toString();

  if (!isRequester && !isRecipient) {
    return next(createError(403, 'Not authorized to block this connection'));
  }

  // Update connection to blocked status
  connection.status = 'blocked';
  connection.isBlocked = true;
  connection.blockedBy = req.user._id;
  connection.blockedAt = new Date();

  await connection.save();

  successResponse(res, 200, 'User blocked successfully');
}));

/**
 * @route   POST /api/connections/:connectionId/unblock
 * @desc    Unblock user
 * @access  Private
 */
router.post('/:connectionId/unblock', authenticateToken, asyncHandler(async (req, res, next) => {
  const { connectionId } = req.params;

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return next(createError(404, 'Connection not found'));
  }

  // Check if current user is the one who blocked
  if (connection.blockedBy.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to unblock this connection'));
  }

  // Remove the connection entirely when unblocking
  await Connection.findByIdAndDelete(connectionId);

  successResponse(res, 200, 'User unblocked successfully');
}));

/**
 * @route   PUT /api/connections/:connectionId/note
 * @desc    Add/update note for connection
 * @access  Private
 */
router.put('/:connectionId/note', authenticateToken, asyncHandler(async (req, res, next) => {
  const { connectionId } = req.params;
  const { note } = req.body;

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return next(createError(404, 'Connection not found'));
  }

  // Check if current user is part of this connection
  const isRequester = connection.requester.toString() === req.user._id.toString();
  const isRecipient = connection.recipient.toString() === req.user._id.toString();

  if (!isRequester && !isRecipient) {
    return next(createError(403, 'Not authorized to update this connection'));
  }

  connection.note = note;
  await connection.save();

  successResponse(res, 200, 'Connection note updated successfully', {
    note: connection.note
  });
}));

/**
 * @route   PUT /api/connections/:connectionId/tags
 * @desc    Add/update tags for connection
 * @access  Private
 */
router.put('/:connectionId/tags', authenticateToken, asyncHandler(async (req, res, next) => {
  const { connectionId } = req.params;
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return next(createError(400, 'Tags must be an array'));
  }

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    return next(createError(404, 'Connection not found'));
  }

  // Check if current user is part of this connection
  const isRequester = connection.requester.toString() === req.user._id.toString();
  const isRecipient = connection.recipient.toString() === req.user._id.toString();

  if (!isRequester && !isRecipient) {
    return next(createError(403, 'Not authorized to update this connection'));
  }

  connection.tags = tags.slice(0, 10); // Limit to 10 tags
  await connection.save();

  successResponse(res, 200, 'Connection tags updated successfully', {
    tags: connection.tags
  });
}));

/**
 * @route   GET /api/connections/mutual/:userId
 * @desc    Get mutual connections with a specific user
 * @access  Private
 */
router.get('/mutual/:userId', authenticateToken, asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (userId === req.user._id.toString()) {
    return next(createError(400, 'Cannot get mutual connections with yourself'));
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(createError(404, 'User not found'));
  }

  const mutualConnections = await Connection.findMutualConnections(req.user._id, userId);
  
  successResponse(res, 200, 'Mutual connections retrieved successfully', {
    mutualConnections: mutualConnections.slice(0, limit),
    count: mutualConnections.length
  });
}));

module.exports = router;

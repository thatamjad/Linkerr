const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Store active socket connections
const activeUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('User not found or inactive'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

const handleConnection = (io) => {
  return async (socket) => {
    console.log(`User ${socket.user.profile.firstName} ${socket.user.profile.lastName} connected: ${socket.id}`);
    
    // Store active user
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date(),
      status: 'online'
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Update user's online status
    await User.findByIdAndUpdate(socket.userId, {
      'activity.isOnline': true,
      'activity.lastSeen': new Date()
    });

    // Broadcast online status to user's connections
    broadcastUserStatus(io, socket.userId, 'online');

    // Handle joining specific rooms
    socket.on('join_room', (roomData) => {
      const { roomType, roomId } = roomData;
      
      // Validate room access based on type
      switch (roomType) {
        case 'post':
          socket.join(`post_${roomId}`);
          break;
        case 'job':
          socket.join(`job_${roomId}`);
          break;
        case 'conversation':
          // Would need to verify user has access to this conversation
          socket.join(`conversation_${roomId}`);
          break;
        default:
          socket.emit('error', { message: 'Invalid room type' });
      }
    });

    // Handle leaving rooms
    socket.on('leave_room', (roomData) => {
      const { roomType, roomId } = roomData;
      socket.leave(`${roomType}_${roomId}`);
    });

    // Handle real-time notifications
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        await Notification.findOneAndUpdate(
          { _id: notificationId, recipient: socket.userId },
          { isRead: true, readAt: new Date() }
        );
        
        socket.emit('notification_marked_read', { notificationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomType, roomId } = data;
      socket.to(`${roomType}_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        userName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomType, roomId } = data;
      socket.to(`${roomType}_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        userName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        isTyping: false
      });
    });

    // Handle real-time post interactions
    socket.on('post_liked', (data) => {
      // Broadcast to post room that someone liked the post
      socket.to(`post_${data.postId}`).emit('post_interaction', {
        type: 'like',
        postId: data.postId,
        userId: socket.userId,
        userName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        timestamp: new Date()
      });
    });

    socket.on('post_commented', (data) => {
      // Broadcast new comment to post room
      socket.to(`post_${data.postId}`).emit('post_interaction', {
        type: 'comment',
        postId: data.postId,
        comment: data.comment,
        userId: socket.userId,
        userName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        timestamp: new Date()
      });
    });

    // Handle connection requests in real-time
    socket.on('connection_request_sent', (data) => {
      // Send to specific user
      io.to(`user_${data.recipientId}`).emit('connection_request_received', {
        requesterId: socket.userId,
        requesterName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        requesterAvatar: socket.user.profile.profilePicture,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Handle job application notifications
    socket.on('job_application_sent', (data) => {
      // Send to job poster
      io.to(`user_${data.jobPosterId}`).emit('job_application_received', {
        applicantId: socket.userId,
        applicantName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        applicantAvatar: socket.user.profile.profilePicture,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        timestamp: new Date()
      });
    });

    // Handle user status updates
    socket.on('update_status', async (status) => {
      try {
        const validStatuses = ['online', 'away', 'busy', 'offline'];
        if (!validStatuses.includes(status)) {
          return socket.emit('error', { message: 'Invalid status' });
        }

        // Update user status in database and memory
        await User.findByIdAndUpdate(socket.userId, {
          'activity.status': status,
          'activity.lastSeen': new Date()
        });

        if (activeUsers.has(socket.userId)) {
          activeUsers.get(socket.userId).status = status;
        }

        // Broadcast status change to connections
        broadcastUserStatus(io, socket.userId, status);
        
        socket.emit('status_updated', { status });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle message/chat functionality (basic implementation)
    socket.on('send_message', (data) => {
      const { recipientId, message, type = 'text' } = data;
      
      // Send message to specific user
      io.to(`user_${recipientId}`).emit('message_received', {
        senderId: socket.userId,
        senderName: `${socket.user.profile.firstName} ${socket.user.profile.lastName}`,
        senderAvatar: socket.user.profile.profilePicture,
        message,
        type,
        timestamp: new Date()
      });

      // Confirm message sent
      socket.emit('message_sent', {
        recipientId,
        message,
        timestamp: new Date()
      });
    });

    // Handle live feed updates
    socket.on('request_live_updates', () => {
      socket.join('live_feed');
    });

    socket.on('stop_live_updates', () => {
      socket.leave('live_feed');
    });

    // Handle disconnect
    socket.on('disconnect', async (reason) => {
      console.log(`User ${socket.user.profile.firstName} ${socket.user.profile.lastName} disconnected: ${reason}`);
      
      // Remove from active users
      activeUsers.delete(socket.userId);
      
      // Update user's offline status
      await User.findByIdAndUpdate(socket.userId, {
        'activity.isOnline': false,
        'activity.lastSeen': new Date(),
        'activity.status': 'offline'
      });

      // Broadcast offline status
      broadcastUserStatus(io, socket.userId, 'offline');
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
      socket.emit('error', { message: 'A socket error occurred' });
    });
  };
};

// Helper function to broadcast user status to their connections
const broadcastUserStatus = async (io, userId, status) => {
  try {
    const Connection = require('../models/Connection');
    
    // Get user's connections
    const connections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    // Broadcast to each connection
    connections.forEach(connection => {
      const connectionUserId = connection.requester.toString() === userId ? 
        connection.recipient.toString() : connection.requester.toString();
      
      io.to(`user_${connectionUserId}`).emit('connection_status_update', {
        userId,
        status,
        timestamp: new Date()
      });
    });
  } catch (error) {
    console.error('Error broadcasting user status:', error);
  }
};

// Function to send notification to specific user
const sendNotificationToUser = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('new_notification', notification);
};

// Function to broadcast to live feed
const broadcastToLiveFeed = (io, data) => {
  io.to('live_feed').emit('live_feed_update', data);
};

// Function to get active users
const getActiveUsers = () => {
  return Array.from(activeUsers.values());
};

// Function to check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

// Function to get user's socket
const getUserSocket = (io, userId) => {
  const activeUser = activeUsers.get(userId);
  if (activeUser) {
    return io.sockets.sockets.get(activeUser.socketId);
  }
  return null;
};

module.exports = {
  socketAuth,
  handleConnection,
  sendNotificationToUser,
  broadcastToLiveFeed,
  getActiveUsers,
  isUserOnline,
  getUserSocket,
  activeUsers
};

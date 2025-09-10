const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/error');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(createError(401, 'Access token is required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (!user) {
      return next(createError(401, 'Invalid token - user not found'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(createError(401, 'Account has been deactivated'));
    }

    // Check if account is locked
    if (user.isLocked) {
      return next(createError(423, 'Account is temporarily locked due to multiple failed login attempts'));
    }

    // Update last active time
    user.lastActiveAt = new Date();
    await user.save();

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid token'));
    }
    next(error);
  }
};

/**
 * Middleware to authenticate optional token (for public routes with optional auth)
 */
const authenticateOptionalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (user && user.isActive && !user.isLocked) {
      user.lastActiveAt = new Date();
      await user.save();
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, don't throw errors, just set user to null
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(createError(401, 'Authentication required'));
  }

  if (!req.user.isVerified) {
    return next(createError(403, 'Email verification required'));
  }

  next();
};

/**
 * Middleware to check if user owns the resource or has permission to access it
 */
const requireOwnership = (resourceParam = 'id', userField = 'author') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceParam];
      const userId = req.user._id;

      // Check if user is admin (admins can access all resources)
      if (req.user.role === 'admin') {
        return next();
      }

      // For dynamic resource checking, this would need to be implemented
      // based on the specific model and requirements
      req.resourceOwnership = {
        resourceId,
        userId,
        userField
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate refresh token
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError(400, 'Refresh token is required'));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(createError(401, 'Invalid refresh token - user not found'));
    }

    // Check if refresh token exists in user's token list
    const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
    
    if (!tokenExists) {
      return next(createError(401, 'Invalid refresh token'));
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Refresh token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid refresh token'));
    }
    next(error);
  }
};

/**
 * Middleware for API key authentication (for external services)
 */
const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return next(createError(401, 'API key is required'));
  }

  // In production, you would validate against a database of API keys
  const validAPIKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];

  if (!validAPIKeys.includes(apiKey)) {
    return next(createError(401, 'Invalid API key'));
  }

  req.apiAuthenticated = true;
  next();
};

/**
 * Middleware to check if user can perform action based on privacy settings
 */
const checkPrivacySettings = (action) => {
  return async (req, res, next) => {
    try {
      const targetUserId = req.params.userId || req.params.id;
      const currentUser = req.user;

      if (!targetUserId || !currentUser) {
        return next();
      }

      // If accessing own resource, allow
      if (targetUserId === currentUser._id.toString()) {
        return next();
      }

      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return next(createError(404, 'User not found'));
      }

      const privacySettings = targetUser.privacySettings;

      // Check specific privacy settings based on action
      switch (action) {
        case 'viewProfile':
          if (privacySettings.profileVisibility === 'private') {
            return next(createError(403, 'This profile is private'));
          }
          if (privacySettings.profileVisibility === 'connections') {
            // Check if users are connected
            const Connection = require('../models/Connection');
            const connectionStatus = await Connection.getConnectionStatus(
              currentUser._id,
              targetUserId
            );
            if (connectionStatus !== 'accepted') {
              return next(createError(403, 'This profile is only visible to connections'));
            }
          }
          break;

        case 'sendMessage':
          if (!privacySettings.allowMessagesFromStrangers) {
            const Connection = require('../models/Connection');
            const connectionStatus = await Connection.getConnectionStatus(
              currentUser._id,
              targetUserId
            );
            if (connectionStatus !== 'accepted') {
              return next(createError(403, 'This user only accepts messages from connections'));
            }
          }
          break;

        default:
          break;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticateToken,
  authenticateOptionalToken,
  requireRole,
  requireVerified,
  requireOwnership,
  validateRefreshToken,
  authenticateAPIKey,
  checkPrivacySettings
};

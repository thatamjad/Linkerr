const { createError } = require('../utils/error');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = createError(400, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = createError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = createError(400, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = createError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = createError(401, message);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = createError(400, message);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = createError(400, message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = createError(400, message);
  }

  // Rate limiting error
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = createError(429, message);
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error';
    error = createError(503, message);
  }

  // Redis connection errors
  if (err.code === 'ECONNREFUSED' && err.port === 6379) {
    const message = 'Cache service unavailable';
    error = createError(503, message);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Don't send stack trace in production
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Send different response based on accept header
  if (req.accepts('json')) {
    res.status(statusCode).json(response);
  } else {
    res.status(statusCode).send(message);
  }

  // In production, you might want to send error to monitoring service
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    // Send to error monitoring service (e.g., Sentry, Rollbar)
    // Example: Sentry.captureException(err);
  }
};

/**
 * Async error handler wrapper
 * Wraps async functions to catch errors and pass to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Development error handler with more detailed information
 */
const developmentErrorHandler = (err, req, res, next) => {
  const response = {
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode || 500,
      stack: err.stack,
      name: err.name
    },
    request: {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  };

  res.status(err.statusCode || 500).json(response);
};

/**
 * Production error handler with minimal information exposure
 */
const productionErrorHandler = (err, req, res, next) => {
  // Don't leak error details
  let message = err.message;
  
  // Only send generic message for 5xx errors
  if (err.statusCode >= 500) {
    message = 'Internal server error';
  }

  const response = {
    success: false,
    error: {
      message,
      statusCode: err.statusCode || 500
    },
    timestamp: new Date().toISOString()
  };

  res.status(err.statusCode || 500).json(response);
};

/**
 * Validation error formatter
 */
const formatValidationErrors = (errors) => {
  const formatted = {};
  
  Object.keys(errors).forEach(key => {
    if (errors[key].name === 'ValidatorError') {
      formatted[key] = errors[key].message;
    }
  });
  
  return formatted;
};

/**
 * Database error handler
 */
const handleDatabaseError = (err) => {
  switch (err.name) {
    case 'ValidationError':
      return createError(400, 'Validation failed', formatValidationErrors(err.errors));
    
    case 'MongoError':
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return createError(400, `${field} already exists`);
      }
      return createError(500, 'Database error');
    
    case 'CastError':
      return createError(400, 'Invalid ID format');
    
    default:
      return createError(500, 'Database error');
  }
};

/**
 * Create custom error response
 */
const createErrorResponse = (statusCode, message, details = null) => {
  return {
    success: false,
    error: {
      message,
      statusCode,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    }
  };
};

module.exports = {
  errorHandler: process.env.NODE_ENV === 'production' ? productionErrorHandler : developmentErrorHandler,
  asyncHandler,
  developmentErrorHandler,
  productionErrorHandler,
  formatValidationErrors,
  handleDatabaseError,
  createErrorResponse
};

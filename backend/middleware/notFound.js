const { createError } = require('../utils/error');

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = createError(404, message);
  next(error);
};

module.exports = { notFound };

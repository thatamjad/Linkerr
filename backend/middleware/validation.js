const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('../utils/error');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});

    return next(createError(400, 'Validation failed', formattedErrors));
  }
  
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('profile.headline')
    .optional()
    .trim()
    .isLength({ max: 220 })
    .withMessage('Headline must be less than 220 characters'),
  
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Profile update validation
 */
const validateProfileUpdate = [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('profile.headline')
    .optional()
    .trim()
    .isLength({ max: 220 })
    .withMessage('Headline must be less than 220 characters'),
  
  body('profile.summary')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Summary must be less than 2000 characters'),
  
  body('profile.location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  
  body('profile.industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry must be less than 100 characters'),
  
  body('profile.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('profile.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('profile.skills.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  
  body('profile.skills.*.level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Skill level must be Beginner, Intermediate, Advanced, or Expert'),
  
  handleValidationErrors
];

/**
 * Post creation validation
 */
const validatePostCreation = [
  body('content')
    .notEmpty()
    .withMessage('Post content is required')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Post content must be less than 3000 characters'),
  
  body('type')
    .optional()
    .isIn(['text', 'image', 'article', 'poll', 'event', 'celebration', 'job_post', 'share'])
    .withMessage('Invalid post type'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'connections', 'followers', 'private'])
    .withMessage('Invalid visibility setting'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),
  
  body('mentions.*')
    .optional()
    .isMongoId()
    .withMessage('Each mention must be a valid user ID'),
  
  handleValidationErrors
];

/**
 * Comment creation validation
 */
const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content is required and must be less than 2000 characters'),
  
  handleValidationErrors
];

/**
 * Job posting validation
 */
const validateJobPosting = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Job title is required and must be less than 200 characters'),
  
  body('company.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name is required and must be less than 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description is required and must be between 50 and 5000 characters'),
  
  body('location.type')
    .isIn(['on_site', 'remote', 'hybrid'])
    .withMessage('Location type must be on_site, remote, or hybrid'),
  
  body('employment.type')
    .isIn(['full_time', 'part_time', 'contract', 'temporary', 'internship', 'volunteer', 'freelance'])
    .withMessage('Invalid employment type'),
  
  body('requirements.skills.required')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  
  handleValidationErrors
];

/**
 * Connection request validation
 */
const validateConnectionRequest = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Connection message must be less than 300 characters'),
  
  handleValidationErrors
];

/**
 * Search query validation
 */
const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  
  query('type')
    .optional()
    .isIn(['users', 'posts', 'jobs', 'companies'])
    .withMessage('Search type must be users, posts, jobs, or companies'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

/**
 * Password reset request validation
 */
const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

/**
 * Password reset validation
 */
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

/**
 * Email verification validation
 */
const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  
  handleValidationErrors
];

/**
 * Change password validation
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

/**
 * ObjectId parameter validation
 */
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Job creation validation (same as job posting)
const validateJobCreation = validateJobPosting;

// Job update validation (all fields optional)
const validateJobUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be less than 100 characters'),
  
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'temporary', 'internship'])
    .withMessage('Invalid job type'),
  
  body('workArrangement')
    .optional()
    .isIn(['remote', 'hybrid', 'onsite'])
    .withMessage('Invalid work arrangement'),
  
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  
  body('status')
    .optional()
    .isIn(['active', 'paused', 'closed', 'expired'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePostCreation,
  validateCommentCreation,
  validateJobPosting,
  validateJobCreation,
  validateJobUpdate,
  validateConnectionRequest,
  validateSearchQuery,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateChangePassword,
  validateObjectId,
  validatePagination
};

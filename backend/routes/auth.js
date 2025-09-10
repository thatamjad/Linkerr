const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const User = require('../models/User');
const { 
  generateTokenPair,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyToken
} = require('../utils/auth');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateChangePassword
} = require('../middleware/validation');
const { authenticateToken, validateRefreshToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 10, // Much higher limit for tests
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // Much higher limit for tests
  message: {
    error: 'Too many failed attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validateUserRegistration, asyncHandler(async (req, res, next) => {
  const { email, password, profile = {} } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createError(400, 'User already exists with this email'));
  }

  // Create user with default profile if not provided
  const userData = {
    email,
    password,
    profile: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      headline: profile.headline || '',
      summary: profile.summary || '',
      location: profile.location || '',
      industry: profile.industry || '',
      website: profile.website || '',
      profilePicture: profile.profilePicture || '',
      coverPhoto: profile.coverPhoto || '',
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      languages: profile.languages || [],
      certifications: profile.certifications || [],
      achievements: profile.achievements || [],
      interests: profile.interests || []
    },
    emailVerificationToken: generateEmailVerificationToken(),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };

  const user = new User(userData);
  await user.save();

  // Generate tokens
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  const tokens = generateTokenPair(user._id, user.role, userAgent, ipAddress);

  // Add refresh token to user
  user.refreshTokens.push({
    token: tokens.refreshToken,
    userAgent,
    ipAddress
  });
  await user.save();

  // TODO: Send email verification email
  // await emailService.sendVerificationEmail(user.email, user.emailVerificationToken);

  successResponse(res, 201, 'User registered successfully', {
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    },
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', strictAuthLimiter, validateUserLogin, asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password +refreshTokens +loginAttempts +lockUntil');
  
  if (!user) {
    return next(createError(401, 'Invalid email or password'));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(createError(423, 'Account temporarily locked due to multiple failed login attempts'));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(createError(401, 'Account has been deactivated'));
  }

  // Check if account is verified
  if (!user.isVerified) {
    return next(createError(401, 'Please verify your email address before logging in'));
  }

  // Verify password
  const isPasswordValid = await user.matchPassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    return next(createError(401, 'Invalid email or password'));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login time
  user.lastLoginAt = new Date();
  user.lastActiveAt = new Date();

  // Generate tokens
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  const tokens = generateTokenPair(user._id, user.role, userAgent, ipAddress);

  // Clean old refresh tokens (keep only last 5)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }

  // Add new refresh token
  user.refreshTokens.push({
    token: tokens.refreshToken,
    userAgent,
    ipAddress,
    lastUsed: new Date()
  });

  await user.save();

  successResponse(res, 200, 'Login successful', {
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile,
      role: user.role,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt
    },
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authLimiter, validateRefreshToken, asyncHandler(async (req, res, next) => {
  const { user, refreshToken } = req;

  // Update refresh token last used time
  const tokenIndex = user.refreshTokens.findIndex(token => token.token === refreshToken);
  if (tokenIndex !== -1) {
    user.refreshTokens[tokenIndex].lastUsed = new Date();
    await user.save();
  }

  // Generate new tokens
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  const tokens = generateTokenPair(user._id, user.role, userAgent, ipAddress);

  // Replace old refresh token with new one
  if (tokenIndex !== -1) {
    user.refreshTokens[tokenIndex] = {
      token: tokens.refreshToken,
      userAgent,
      ipAddress,
      lastUsed: new Date()
    };
    await user.save();
  }

  successResponse(res, 200, 'Token refreshed successfully', {
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  const user = req.user;

  if (refreshToken) {
    // Remove specific refresh token
    user.refreshTokens = user.refreshTokens.filter(token => token.token !== refreshToken);
    await user.save();
  }

  successResponse(res, 200, 'Logged out successfully');
}));

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticateToken, asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Remove all refresh tokens
  user.refreshTokens = [];
  await user.save();

  successResponse(res, 200, 'Logged out from all devices successfully');
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authLimiter, validatePasswordResetRequest, asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return successResponse(res, 200, 'If an account with that email exists, a password reset link has been sent');
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken();
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await user.save();

  // TODO: Send password reset email
  // await emailService.sendPasswordResetEmail(user.email, resetToken);

  successResponse(res, 200, 'If an account with that email exists, a password reset link has been sent');
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', authLimiter, validatePasswordReset, asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  // Find user by reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return next(createError(400, 'Invalid or expired reset token'));
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Invalidate all refresh tokens for security
  user.refreshTokens = [];
  
  await user.save();

  successResponse(res, 200, 'Password has been reset successfully');
}));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', authLimiter, validateEmailVerification, asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  // Find user by verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(createError(400, 'Invalid or expired verification token'));
  }

  // Mark email as verified
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  await user.save();

  successResponse(res, 200, 'Email verified successfully');
}));

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', authenticateToken, authLimiter, asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (user.isVerified) {
    return next(createError(400, 'Email is already verified'));
  }

  // Generate new verification token
  const verificationToken = generateEmailVerificationToken();
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await user.save();

  // TODO: Send verification email
  // await emailService.sendVerificationEmail(user.email, verificationToken);

  successResponse(res, 200, 'Verification email sent');
}));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/change-password', authenticateToken, validateChangePassword, asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.matchPassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return next(createError(400, 'Current password is incorrect'));
  }

  // Update password
  user.password = newPassword;
  
  // Invalidate all refresh tokens except current session for security
  const currentRefreshToken = req.headers['x-refresh-token'];
  if (currentRefreshToken) {
    user.refreshTokens = user.refreshTokens.filter(token => token.token === currentRefreshToken);
  } else {
    user.refreshTokens = [];
  }
  
  await user.save();

  successResponse(res, 200, 'Password changed successfully');
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  
  successResponse(res, 200, 'User profile retrieved successfully', {
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      connectionCount: user.connectionCount,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt
    }
  });
}));

/**
 * @route   GET /api/auth/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('refreshTokens');
  
  const sessions = user.refreshTokens.map(token => ({
    id: token._id,
    device: token.userAgent || 'Unknown Device',
    ipAddress: token.ipAddress,
    lastUsed: token.lastUsed,
    createdAt: token.createdAt
  }));

  successResponse(res, 200, 'Active sessions retrieved successfully', {
    sessions
  });
}));

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId', authenticateToken, asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  const user = await User.findById(req.user._id).select('refreshTokens');

  const sessionIndex = user.refreshTokens.findIndex(token => token._id.toString() === sessionId);
  
  if (sessionIndex === -1) {
    return next(createError(404, 'Session not found'));
  }

  user.refreshTokens.splice(sessionIndex, 1);
  await user.save();

  successResponse(res, 200, 'Session revoked successfully');
}));

// OAuth Routes

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return next(createError(503, 'Google OAuth is not configured. Please contact the administrator.'));
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })(req, res, next);
});

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
  }), 
  asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      
      // Generate tokens
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress;
      const tokens = generateTokenPair(user._id, user.role, userAgent, ipAddress);

      // Add refresh token to user
      user.refreshTokens.push({
        token: tokens.refreshToken,
        userAgent,
        ipAddress,
        lastUsed: new Date()
      });
      
      // Update last login
      user.lastLoginAt = new Date();
      user.lastActiveAt = new Date();
      await user.save();

      // Redirect to frontend with tokens as URL parameters (temporary, should be handled more securely)
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}&provider=google`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback_failed`);
    }
  })
);

/**
 * @route   GET /api/auth/linkedin
 * @desc    Initiate LinkedIn OAuth
 * @access  Public
 */
router.get('/linkedin', (req, res, next) => {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    return next(createError(503, 'LinkedIn OAuth is not configured. Please contact the administrator.'));
  }
  passport.authenticate('linkedin', { 
    session: false 
  })(req, res, next);
});

/**
 * @route   GET /api/auth/linkedin/callback
 * @desc    LinkedIn OAuth callback
 * @access  Public
 */
router.get('/linkedin/callback', 
  passport.authenticate('linkedin', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
  }), 
  asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      
      // Generate tokens
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress;
      const tokens = generateTokenPair(user._id, user.role, userAgent, ipAddress);

      // Add refresh token to user
      user.refreshTokens.push({
        token: tokens.refreshToken,
        userAgent,
        ipAddress,
        lastUsed: new Date()
      });
      
      // Update last login
      user.lastLoginAt = new Date();
      user.lastActiveAt = new Date();
      await user.save();

      // Redirect to frontend with tokens as URL parameters (temporary, should be handled more securely)
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}&provider=linkedin`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback_failed`);
    }
  })
);

/**
 * @route   POST /api/auth/oauth/verify
 * @desc    Verify OAuth token and get user data (for NextAuth integration)
 * @access  Public
 */
router.post('/oauth/verify', asyncHandler(async (req, res, next) => {
  const { token, provider } = req.body;

  if (!token || !provider) {
    return next(createError(400, 'Token and provider are required'));
  }

  try {
    // Verify the token
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return next(createError(401, 'User not found or inactive'));
    }

    // Check if user has the specified OAuth provider
    const hasProvider = user.oauthProviders[provider] && user.oauthProviders[provider].id;
    
    if (!hasProvider) {
      return next(createError(401, 'OAuth provider not linked to this account'));
    }

    successResponse(res, 200, 'Token verified successfully', {
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isVerified: user.isVerified,
        oauthProviders: user.oauthProviders
      }
    });
  } catch (error) {
    console.error('OAuth token verification error:', error);
    return next(createError(401, 'Invalid or expired token'));
  }
}));

module.exports = router;

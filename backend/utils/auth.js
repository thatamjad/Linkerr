const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateAccessToken = (userId, role = 'user') => {
  return jwt.sign(
    { 
      id: userId, 
      role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'professional-networking-app',
      audience: 'professional-networking-users'
    }
  );
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId, role = 'user') => {
  return jwt.sign(
    { 
      id: userId, 
      role,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'professional-networking-app',
      audience: 'professional-networking-users'
    }
  );
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {string} userAgent - User agent string
 * @param {string} ipAddress - Client IP address
 * @returns {Object} Token pair with metadata
 */
const generateTokenPair = (userId, role = 'user', userAgent = '', ipAddress = '') => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);
  
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    metadata: {
      userAgent,
      ipAddress,
      issuedAt: new Date(),
      deviceInfo: parseUserAgent(userAgent)
    }
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, type = 'access') => {
  const secret = type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  
  try {
    const decoded = jwt.verify(token, secret);
    
    // Verify token type matches
    if (decoded.type !== type) {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Generate email verification token
 * @returns {string} Verification token
 */
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate password reset token
 * @returns {string} Reset token
 */
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate API key
 * @param {string} prefix - Prefix for the API key
 * @returns {string} API key
 */
const generateAPIKey = (prefix = 'pn') => {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
};

/**
 * Generate secure random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateSecureRandomString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Hash string using SHA-256
 * @param {string} str - String to hash
 * @returns {string} Hashed string
 */
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
const generateHMACSignature = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} Verification result
 */
const verifyHMACSignature = (data, signature, secret) => {
  const expectedSignature = generateHMACSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Parse user agent string for device information
 * @param {string} userAgent - User agent string
 * @returns {Object} Parsed device information
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) return {};
  
  const isDesktop = /Windows|Macintosh|Linux/.test(userAgent);
  const isMobile = /Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
  
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  return {
    browser,
    os,
    device: isTablet ? 'tablet' : isMobile ? 'mobile' : isDesktop ? 'desktop' : 'unknown',
    userAgent
  };
};

/**
 * Generate temporary authentication code
 * @param {number} length - Code length
 * @returns {string} Numeric code
 */
const generateAuthCode = (length = 6) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

/**
 * Generate session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return crypto.randomUUID();
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

/**
 * Check if token is expired
 * @param {Object} decodedToken - Decoded JWT token
 * @returns {boolean} Whether token is expired
 */
const isTokenExpired = (decodedToken) => {
  if (!decodedToken.exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};

/**
 * Get token expiry time in milliseconds
 * @param {Object} decodedToken - Decoded JWT token
 * @returns {number|null} Expiry time in milliseconds
 */
const getTokenExpiryTime = (decodedToken) => {
  if (!decodedToken.exp) return null;
  
  return decodedToken.exp * 1000;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  generateAPIKey,
  generateSecureRandomString,
  hashString,
  generateHMACSignature,
  verifyHMACSignature,
  parseUserAgent,
  generateAuthCode,
  generateSessionId,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpiryTime
};

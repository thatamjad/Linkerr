// Vercel serverless function entry point
try {
  const app = require('../server-vercel');
  
  // Export the Express app as a Vercel function
  module.exports = app;
} catch (error) {
  console.error('❌ Failed to initialize serverless function:', error);
  console.error('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? '✓ Set' : '❌ Missing',
    JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '❌ Missing',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? '✓ Set' : '❌ Missing',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✓ Set' : '❌ Missing'
  });
  
  // Export a minimal error handler
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  };
}

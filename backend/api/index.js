// Vercel serverless function entry point
const app = require('../server-vercel');

// Export the Express app as a Vercel function
module.exports = app;

// Vercel serverless function entry point
// This handles all /api/* routes

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const app = require('../server/index');

// Export for Vercel serverless - this will handle all routes
module.exports = app;

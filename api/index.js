// Vercel serverless function entry point
// This file imports the Express app from the server folder

// Set up environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import the Express app
const app = require('../server/index');

// Export for Vercel serverless
module.exports = app;

// Catch-all route for Vercel serverless functions
// This handles all /api/* routes

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const app = require('../server/index');

module.exports = app;

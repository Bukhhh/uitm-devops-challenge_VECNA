#!/usr/bin/env node

/**
 * RentVerse Persistent Development Server
 * Does NOT shut down during testing - keeps running indefinitely
 */

const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Override process.exit to prevent any shutdown
const originalExit = process.exit;
process.exit = function(code) {
  console.log(`[PERSISTENT MODE] Blocked exit code: ${code}`);
  // Don't actually exit
};

// Ignore all signals - keep server running
process.on('SIGINT', () => {
  console.log('[PERSISTENT MODE] SIGINT ignored - server staying online');
});

process.on('SIGTERM', () => {
  console.log('[PERSISTENT MODE] SIGTERM ignored - server staying online');
});

process.on('SIGHUP', () => {
  console.log('[PERSISTENT MODE] SIGHUP ignored - server staying online');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Don't exit, keep running
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, keep running
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===================================');
    console.log(`🚀 PERSISTENT SERVER on port ${PORT}`);
    console.log('🚀 Environment: development');
    console.log('🚀 ===================================');
    console.log('');
    console.log('📚 API Documentation:');
    console.log(`📚   http://localhost:${PORT}/docs`);
    console.log('');
    console.log('🏥 Health Check:');
    console.log(`🏥   http://localhost:${PORT}/health`);
    console.log('');
    console.log('🔗 API Base URL:');
    console.log(`🔗   http://localhost:${PORT}/api`);
    console.log('');
    console.log('⚡ [PERSISTENT MODE] Server will NOT shutdown during tests');
    console.log('');
  });
});

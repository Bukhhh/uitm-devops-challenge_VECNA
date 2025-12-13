#!/usr/bin/env node

/**
 * RentVerse Backend - Development Server
 * Runs permanently without shutting down on test signals
 */

const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;
let testMode = false;

// Detect test mode - ignore shutdown signals during tests
const originalExit = process.exit;
process.exit = function(code) {
  if (testMode) {
    console.log(`[TEST MODE] Ignoring exit code ${code}`);
    return;
  }
  originalExit(code);
};

// Graceful shutdown only on explicit Ctrl+C (not from tests)
const gracefulShutdown = async (signal) => {
  // Only shutdown if not in test mode
  if (testMode) {
    console.log(`[TEST MODE] Ignoring ${signal} signal`);
    return;
  }

  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    await disconnectDB();
    console.log('👋 Database disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Set test mode when tests are running
process.on('message', (msg) => {
  if (msg === 'TEST_MODE_START') {
    testMode = true;
    console.log('[SERVER] Test mode enabled - ignoring shutdown signals');
  } else if (msg === 'TEST_MODE_END') {
    testMode = false;
    console.log('[SERVER] Test mode disabled');
  }
});

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===================================');
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
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
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');
  });

  // Prevent server from closing on unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
});

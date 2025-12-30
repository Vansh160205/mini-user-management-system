/**
 * Server Entry Point
 *
 * Starts the Express server after verifying database connectivity.
 * Handles graceful shutdown for production environments (Render).
 */

require('dotenv').config();
const http = require('http');
const app = require('./src/app'); // adjust path if needed
const {
  testConnection,
  closePool,
} = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = http.createServer(app);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    console.log('🔄 Checking PostgreSQL connection...');

    const isDbConnected = await testConnection();
    if (!isDbConnected) {
      console.error('❌ Server startup aborted due to DB connection failure');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log('----------------------------------------');
      console.log(`🚀 Server running`);
      console.log(`🌍 Environment : ${NODE_ENV}`);
      console.log(`📡 Port        : ${PORT}`);
      console.log('----------------------------------------');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

/**
 * Graceful Shutdown
 * Required for Render / Railway / Docker
 */
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log('🔌 HTTP server closed');

    await closePool();

    console.log('✅ Shutdown complete');
    process.exit(0);
  });

  // Force shutdown if it hangs
  setTimeout(() => {
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

/**
 * Server Entry Point
 *
 * Loads environment variables, connects to MongoDB,
 * and starts the Express server.
 * Application logic lives in src/app.js
 */

require('dotenv').config();

const app = require('./src/app');
const {connectDB} = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║       Mini User Management System - Backend API       ║
╠═══════════════════════════════════════════════════════╣
║  Status:      Running                                 ║
║  Environment: ${NODE_ENV.padEnd(41)}║
║  Port:        ${String(PORT).padEnd(41)}║
║  Health:      http://localhost:${PORT}/api/health${' '.repeat(14)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Server startup failed');
    process.exit(1);
  }
};

startServer();

// ======================
// GRACEFUL SHUTDOWN
// ======================

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = server;

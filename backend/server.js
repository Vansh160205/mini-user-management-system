/**
 * Server Entry Point
 * 
 * Initializes and starts the Express server.
 */

// Force IPv4 at the very beginning
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();

const app = require('./src/app');
const { testConnection, closePool } = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 MINI USER MANAGEMENT SYSTEM');
  console.log('='.repeat(60));
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Node: ${process.version}`);
  console.log(`📍 Platform: ${process.platform}`);
  console.log('='.repeat(60));

  // Test database connection
  console.log('\n📦 DATABASE CONNECTION');
  console.log('-'.repeat(60));
  
  const isConnected = await testConnection(3);
  
  if (!isConnected) {
    console.log('\n' + '!'.repeat(60));
    console.error('❌ DATABASE CONNECTION FAILED');
    console.log('!'.repeat(60));
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify DATABASE_URL in Render environment');
    console.log('   2. Use Internal Database URL from Render PostgreSQL');
    console.log('   3. Ensure database is created and running');
    console.log('   4. Check database credentials');
    console.log('');
    
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  // Start server
  console.log('\n🌐 HTTP SERVER');
  console.log('-'.repeat(60));
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on port ${PORT}`);
    console.log(`🔗 Health check: /health`);
    console.log('='.repeat(60) + '\n');
  });
  
  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await closePool();
      console.log('Goodbye! 👋');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
  });
};

startServer();
/**
 * Server Entry Point
 */

require('dotenv').config();

const app = require('./src/app');
const { testConnection, closePool } = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 MINI USER MANAGEMENT SYSTEM');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log('='.repeat(50));

  // Test database
  console.log('\n📦 DATABASE');
  console.log('-'.repeat(50));
  
  const connected = await testConnection(3);
  
  if (!connected) {
    console.error('\n❌ Database connection failed!');
    console.log('\n💡 If using Supabase:');
    console.log('   1. Check if project is paused at supabase.com/dashboard');
    console.log('   2. Resume the project if paused');
    console.log('   3. Use the Connection Pooling URL (port 6543)');
    console.log('   4. Verify DATABASE_URL is correct\n');
    
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Start server
  console.log('\n🌐 SERVER');
  console.log('-'.repeat(50));
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Listening on port ${PORT}`);
    console.log('='.repeat(50) + '\n');
  });

  // Shutdown handlers
  const shutdown = async (signal) => {
    console.log(`\n${signal} - Shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
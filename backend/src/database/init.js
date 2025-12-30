/**
 * Database Initialization Script
 * 
 * Reads and executes schema.sql to set up database tables.
 * Can be run standalone: npm run db:init
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool, connectDB } = require('../config/db');

/**
 * Initialize database schema
 */
const initializeDatabase = async () => {
  console.log('🔄 Starting database initialization...\n');

  try {
    // Test connection first
    await connectDB();

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📄 Reading schema.sql...');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Schema executed successfully!\n');

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Verify indexes
    const indexesResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND tablename = 'users'
    `);

    console.log('\n📇 Created indexes:');
    indexesResult.rows.forEach((row) => {
      console.log(`   - ${row.indexname}`);
    });

    console.log('\n✅ Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  } finally {
    // Close pool connection
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
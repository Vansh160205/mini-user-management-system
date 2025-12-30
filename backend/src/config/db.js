/**
 * PostgreSQL Database Configuration
 * 
 * Creates a connection pool and exports connection utilities.
 */

const { Pool } = require('pg');

// Pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  // Pool settings
  max: 20,                    // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection
};

const pool = new Pool(poolConfig);

// Pool error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

/**
 * Connect to PostgreSQL database
 * Tests the connection and exits if it fails
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    
    // Get database info
    const result = await client.query('SELECT current_database(), current_user');
    const { current_database, current_user } = result.rows[0];
    
    console.log(`✅ PostgreSQL connected`);
    console.log(`   Database: ${current_database}`);
    console.log(`   User: ${current_user}`);
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Close all pool connections
 */
const closeDB = async () => {
  try {
    await pool.end();
    console.log('🔌 PostgreSQL pool closed');
  } catch (error) {
    console.error('Error closing pool:', error.message);
  }
};

module.exports = { pool, connectDB, closeDB };
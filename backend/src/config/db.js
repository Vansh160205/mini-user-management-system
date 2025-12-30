/**
 * Database Configuration
 * 
 * PostgreSQL connection pool configuration.
 * Compatible with Supabase, Render, Railway, and other providers.
 */

const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create database connection configuration
 */
const createConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    return null;
  }

  // Log connection info (without password)
  try {
    const url = new URL(databaseUrl);
    console.log('📍 Database Host:', url.hostname);
    console.log('📍 Database Port:', url.port || '5432');
    console.log('📍 Database Name:', url.pathname.slice(1));
    console.log('📍 SSL Enabled:', isProduction);
  } catch (e) {
    console.log('📍 Using DATABASE_URL');
  }

  return {
    connectionString: databaseUrl,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased for Supabase cold starts
  };
};

// Create pool
const config = createConfig();
const pool = config ? new Pool(config) : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
  });
}

/**
 * Test database connection
 */
const testConnection = async (retries = 3) => {
  if (!pool) {
    console.error('❌ Database pool not initialized');
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${retries}...`);
      
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as time, current_database() as db');
      client.release();
      
      console.log('✅ Database connected!');
      console.log(`   Database: ${result.rows[0].db}`);
      console.log(`   Time: ${result.rows[0].time}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      // Helpful error messages
      if (error.message.includes('ENOTFOUND')) {
        console.error('💡 Hostname not found. Check if:');
        console.error('   - Supabase project is active (not paused)');
        console.error('   - DATABASE_URL is correct');
      } else if (error.message.includes('password')) {
        console.error('💡 Authentication failed. Check your password.');
      } else if (error.message.includes('timeout')) {
        console.error('💡 Connection timeout. Database might be starting up.');
      } else if (error.message.includes('ENETUNREACH')) {
        console.error('💡 Network unreachable. Try using connection pooling URL.');
      }
      
      if (attempt < retries) {
        const wait = attempt * 3000;
        console.log(`⏳ Waiting ${wait/1000}s before retry...`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  
  return false;
};

/**
 * Execute query
 */
const query = async (text, params) => {
  if (!pool) throw new Error('Database not initialized');
  return pool.query(text, params);
};

/**
 * Get client for transactions
 */
const getClient = async () => {
  if (!pool) throw new Error('Database not initialized');
  return pool.connect();
};

/**
 * Close pool
 */
const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('✅ Database pool closed');
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool,
};
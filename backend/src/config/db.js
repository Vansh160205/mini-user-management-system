/**
 * Database Configuration
 * 
 * PostgreSQL connection pool configuration.
 * Handles connection settings for different environments.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Parse the DATABASE_URL for connection config
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Force IPv4 to avoid IPv6 connectivity issues on some platforms
  family: 4,
  
  // SSL configuration for production (required by Render, Railway, etc.)
  ssl: isProduction ? {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  } : false,
  
  // Connection pool settings
  max: 20,                     // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,    // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection not established
};

// Create connection pool
const pool = new Pool(connectionConfig);

// Connection event handlers
pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Test database connection
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ENETUNREACH')) {
      console.error('💡 Tip: This may be an IPv6 connectivity issue. Ensure DATABASE_URL uses a hostname that resolves to IPv4.');
    }
    if (error.message.includes('SSL')) {
      console.error('💡 Tip: SSL may be required. Check your database provider settings.');
    }
    if (error.message.includes('password')) {
      console.error('💡 Tip: Check your DATABASE_URL credentials.');
    }
    
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

/**
 * Execute a query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('Slow query:', { text, duration: `${duration}ms`, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Get a client from the pool (for transactions)
 * @returns {Promise<Object>} - Pool client
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);
  
  // Set a timeout of 5 seconds, after which we will log a warning
  const timeout = setTimeout(() => {
    console.warn('Client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Override release to clear the timeout
  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };
  
  client.query = (...args) => {
    return originalQuery(...args);
  };
  
  return client;
};

/**
 * Close the pool (for graceful shutdown)
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ PostgreSQL pool closed');
  } catch (error) {
    console.error('❌ Error closing PostgreSQL pool:', error.message);
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool,
};
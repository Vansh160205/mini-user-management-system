/**
 * Database Module
 * 
 * Centralized database access point.
 * Exports pool and query helper functions.
 */

const { pool } = require('../config/db');

/**
 * Execute a query with optional parameters
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', {
        text: text.substring(0, 100),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<object>} Pool client
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Set a timeout of 5 seconds, after which we release the client
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Override release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
};

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Function that receives client and executes queries
 * @returns {Promise<any>} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  getClient,
  transaction,
  pool,
};
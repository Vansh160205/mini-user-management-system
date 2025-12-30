/**
 * Database Configuration
 * 
 * PostgreSQL connection pool configuration.
 * Manually resolves hostname to IPv4 to avoid IPv6 issues.
 */

const { Pool } = require('pg');
const dns = require('dns');
const { URL } = require('url');
require('dotenv').config();

// Force IPv4 globally
dns.setDefaultResultOrder('ipv4first');

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Pool instance (will be initialized after DNS resolution)
let pool = null;

/**
 * Resolve hostname to IPv4 address
 * @param {string} hostname - Hostname to resolve
 * @returns {Promise<string>} - IPv4 address
 */
const resolveToIPv4 = (hostname) => {
  return new Promise((resolve, reject) => {
    // If it's already an IP address, return it
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      resolve(hostname);
      return;
    }

    // Force IPv4 resolution
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        console.error(`❌ Failed to resolve ${hostname} to IPv4:`, err.message);
        // Fallback: try regular lookup with IPv4 preference
        dns.lookup(hostname, { family: 4 }, (lookupErr, address) => {
          if (lookupErr) {
            reject(lookupErr);
          } else {
            console.log(`✅ Resolved ${hostname} to ${address} (via lookup)`);
            resolve(address);
          }
        });
      } else {
        console.log(`✅ Resolved ${hostname} to ${addresses[0]} (via resolve4)`);
        resolve(addresses[0]);
      }
    });
  });
};

/**
 * Initialize the database pool with IPv4 resolution
 * @returns {Promise<Pool>} - PostgreSQL pool
 */
const initializePool = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔧 Parsing database connection URL...');

  try {
    // Parse the DATABASE_URL
    const url = new URL(databaseUrl);
    const originalHost = url.hostname;
    
    console.log(`📍 Original host: ${originalHost}`);
    console.log(`📍 Database: ${url.pathname.slice(1)}`);
    console.log(`📍 Port: ${url.port || 5432}`);

    // Resolve hostname to IPv4
    console.log('🔄 Resolving hostname to IPv4...');
    const ipv4Address = await resolveToIPv4(originalHost);
    
    // Replace hostname with IPv4 address
    url.hostname = ipv4Address;
    const ipv4DatabaseUrl = url.toString();
    
    console.log(`✅ Using IPv4 address: ${ipv4Address}`);

    // Create connection config with IPv4 URL
    const connectionConfig = {
      connectionString: ipv4DatabaseUrl,
      ssl: isProduction ? {
        rejectUnauthorized: false,
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    // Create pool
    pool = new Pool(connectionConfig);

    // Set up event handlers
    pool.on('connect', () => {
      console.log('✅ New client connected to PostgreSQL');
    });

    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err.message);
    });

    return pool;

  } catch (error) {
    console.error('❌ Failed to initialize database pool:', error.message);
    throw error;
  }
};

/**
 * Get or create the pool
 * @returns {Promise<Pool>}
 */
const getPool = async () => {
  if (!pool) {
    await initializePool();
  }
  return pool;
};

/**
 * Test database connection
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    try {
      console.log(`\n🔄 Connection attempt ${attempt}/${retries}...`);
      
      // Ensure pool is initialized
      const dbPool = await getPool();
      
      client = await dbPool.connect();
      const result = await client.query('SELECT NOW() as now, current_database() as db, inet_server_addr() as server_ip');
      
      console.log('✅ PostgreSQL connected successfully!');
      console.log(`   Database: ${result.rows[0].db}`);
      console.log(`   Server IP: ${result.rows[0].server_ip}`);
      console.log(`   Server time: ${result.rows[0].now}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (error.message.includes('ENETUNREACH')) {
        console.error('💡 IPv6 connectivity issue detected');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 Connection refused - check if database is running');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('💡 Hostname not found - check DATABASE_URL');
      } else if (error.message.includes('timeout')) {
        console.error('💡 Connection timeout - database may be slow');
      } else if (error.message.includes('password') || error.message.includes('authentication')) {
        console.error('💡 Authentication failed - check credentials');
      }
      
      // Reset pool for next attempt
      if (pool) {
        try {
          await pool.end();
        } catch (e) {}
        pool = null;
      }
      
      if (attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  
  return false;
};

/**
 * Execute a query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
const query = async (text, params) => {
  const dbPool = await getPool();
  const start = Date.now();
  
  try {
    const result = await dbPool.query(text, params);
    const duration = Date.now() - start;
    
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
  const dbPool = await getPool();
  const client = await dbPool.connect();
  
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);
  
  const timeout = setTimeout(() => {
    console.warn('⚠️ Client checked out for more than 5 seconds');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };
  
  client.query = (...args) => originalQuery(...args);
  
  return client;
};

/**
 * Close the pool
 */
const closePool = async () => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('✅ PostgreSQL pool closed');
    } catch (error) {
      console.error('❌ Error closing pool:', error.message);
    }
  }
};

module.exports = {
  get pool() { return pool; },
  query,
  getClient,
  getPool,
  testConnection,
  closePool,
  initializePool,
};
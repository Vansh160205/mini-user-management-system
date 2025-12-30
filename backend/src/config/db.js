const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), current_user');
    console.log(`✅ PostgreSQL connected: ${result.rows[0].current_database} as ${result.rows[0].current_user}`);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await pool.end();
    console.log('🔌 PostgreSQL pool closed');
  } catch (err) {
    console.error('Error closing pool:', err.message);
  }
};

module.exports = { pool, connectDB, closeDB };

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load env based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

// Supabase always requires SSL
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(1);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT current_database(), current_user'
    );

    console.log('✅ PostgreSQL connected');
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   User: ${result.rows[0].current_user}`);

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

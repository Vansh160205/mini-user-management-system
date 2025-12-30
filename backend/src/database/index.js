const { pool } = require('../config/db');

const logQuery = process.env.SUPPRESS_LOGS !== 'true';

const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (logQuery) {
    console.log('Executed query', { text: text.substring(0, 100), duration: `${Date.now() - start}ms`, rows: result.rowCount });
  }
  return result;
};

const getClient = async () => {
  const client = await pool.connect();
  const originalRelease = client.release.bind(client);

  const timeout = setTimeout(() => console.error('A client has been checked out for more than 5 seconds!'), 5000);

  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };

  return client;
};

const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, getClient, transaction };

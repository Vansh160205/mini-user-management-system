/**
 * Jest Test Setup
 * 
 * Configuration and setup for test environment.
 * Runs before all test suites.
 */

require('dotenv').config({ path: '.env.test' });

const { pool } = require('../src/config/db');

console.log(process.env.NODE_ENV)
// Increase timeout for database operations
jest.setTimeout(10000);

// Clean up database connections after all tests
afterAll(async () => {
  await pool.end();
});

// Suppress console.log during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}
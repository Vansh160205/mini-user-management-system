/**
 * Password Hashing Utilities
 * 
 * Handles password hashing and comparison using bcrypt.
 * bcrypt automatically handles salt generation and storage.
 */

const bcrypt = require('bcrypt');

// Number of salt rounds for bcrypt
// Higher = more secure but slower
// 10-12 is recommended for production
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
const hashPassword = async (password) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error.message);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare plain text password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 * @throws {Error} If comparison fails
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error.message);
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Check if a password needs to be rehashed
 * Useful when upgrading SALT_ROUNDS
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if rehashing is recommended
 */
const needsRehash = async (hashedPassword) => {
  try {
    const rounds = await bcrypt.getRounds(hashedPassword);
    return rounds < SALT_ROUNDS;
  } catch (error) {
    console.error('Error checking hash rounds:', error.message);
    return false;
  }
};

/**
 * Generate a random password
 * Useful for temporary passwords or password reset
 * @param {number} [length=12] - Password length
 * @returns {string} Random password
 */
const generateRandomPassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
};

module.exports = {
  hashPassword,
  comparePassword,
  needsRehash,
  generateRandomPassword,
  SALT_ROUNDS,
};
/**
 * Controllers Index
 * 
 * Central export point for all controllers.
 */

const authController = require('./auth.controller');
const userController = require('./user.controller');
module.exports = {
  authController,
  userController
};
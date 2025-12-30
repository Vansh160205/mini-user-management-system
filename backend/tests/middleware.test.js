/**
 * Middleware Tests
 * 
 * Tests for custom middleware:
 * - Authentication middleware
 * - Authorization middleware
 * - Validation middleware
 */

const request = require('supertest');
const express = require('express');
const { authenticate, authorize, validateSignup } = require('../src/middleware');
const { generateToken, sendSuccess } = require('../src/utils');
const { User } = require('../src/models');
const { hashPassword } = require('../src/utils/password');
const { pool } = require('../src/config/db');

describe('Middleware', () => {
  describe('Authentication Middleware', () => {
    let app;
    let testUser;
    let validToken;

    beforeAll(async () => {
      // Clean and create test user
      await pool.query('DELETE FROM users WHERE email = $1', ['middleware@test.com']);
      
      testUser = await User.create({
        email: 'middleware@test.com',
        password: await hashPassword('Test@123456'),
        full_name: 'Middleware Test',
        role: 'user',
        status: 'active',
      });

      validToken = generateToken({
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      // Create test app
      app = express();
      app.use(express.json());
      
      app.get('/protected', authenticate, (req, res) => {
        sendSuccess(res, { data: { user: req.user } });
      });

      // Error handler
      app.use((err, req, res, next) => {
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message,
        });
      });
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUser.id);
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should deny access with expired token', async () => {
      const expiredToken = generateToken(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });
  });

  describe('Authorization Middleware', () => {
    let app;
    let adminToken;
    let userToken;

    beforeAll(async () => {
      // Create test users
      const admin = await User.create({
        email: 'admin.middleware@test.com',
        password: await hashPassword('Admin@123456'),
        full_name: 'Admin Middleware',
        role: 'admin',
        status: 'active',
      });

      const user = await User.create({
        email: 'user.middleware@test.com',
        password: await hashPassword('User@123456'),
        full_name: 'User Middleware',
        role: 'user',
        status: 'active',
      });

      adminToken = generateToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
      });

      userToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Create test app
      app = express();
      app.use(express.json());
      
      app.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
        sendSuccess(res, { message: 'Admin access granted' });
      });

      app.get('/user-only', authenticate, authorize('user'), (req, res) => {
        sendSuccess(res, { message: 'User access granted' });
      });

      // Error handler
      app.use((err, req, res, next) => {
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message,
        });
      });
    });

    it('should allow admin to access admin-only route', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny user access to admin-only route', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should allow user to access user-only route', async () => {
      const response = await request(app)
        .get('/user-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Validation Middleware', () => {
    let app;

    beforeAll(() => {
      app = express();
      app.use(express.json());
      
      app.post('/signup', validateSignup, (req, res) => {
        sendSuccess(res, { message: 'Validation passed' });
      });

      // Error handler
      app.use((err, req, res, next) => {
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message,
          error: { details: err.errors },
        });
      });
    });

    it('should pass with valid signup data', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'valid@example.com',
          password: 'Valid@123456',
          full_name: 'Valid User',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'invalid-email',
          password: 'Valid@123456',
          full_name: 'Valid User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'valid@example.com',
          password: 'weak',
          full_name: 'Valid User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({ field: 'password' })
      );
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'valid@example.com',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });
  });
});
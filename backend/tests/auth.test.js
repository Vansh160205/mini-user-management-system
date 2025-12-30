/**
 * Authentication Tests
 * 
 * Tests for authentication endpoints:
 * - Signup
 * - Login
 * - Get current user
 * - Token verification
 */

const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const { hashPassword, generateToken } = require('../src/utils');
const { pool } = require('../src/config/db');

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'Test@123456',
  full_name: 'Test User',
};

const adminUser = {
  email: 'admin@test.com',
  password: 'Admin@123456',
  full_name: 'Test Admin',
  role: 'admin',
};

describe('Authentication Endpoints', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [
      testUser.email,
      adminUser.email,
    ]);
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.full_name).toBe(testUser.full_name);
      expect(response.body.data.user.role).toBe('user');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      // Create first user
      await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'Wrong@123456',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail with inactive user', async () => {
      // Deactivate user
      await User.update(
        (await User.findByEmail(testUser.email)).id,
        { status: 'inactive' }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create and login user
      const user = await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
      });
      userId = user.id;

      authToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.id).toBe(userId);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No authentication token provided');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/verify', () => {
    let authToken;

    beforeEach(async () => {
      const user = await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
      });

      authToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.data.valid).toBe(true);
    });
  });
});
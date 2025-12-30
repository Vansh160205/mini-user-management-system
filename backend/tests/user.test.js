/**
 * User Management Tests
 * 
 * Tests for user management endpoints:
 * - Get all users
 * - Get user by ID
 * - Update user
 * - Change password
 * - Activate/deactivate user
 * - Delete user
 */

const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const { hashPassword, generateToken } = require('../src/utils');
const { pool } = require('../src/config/db');

describe('User Management Endpoints', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;
  let testUserId;

  // Setup test users
  beforeAll(async () => {
    // Clean up
    await pool.query('DELETE FROM users');

    // Create admin
    const admin = await User.create({
      email: 'admin@test.com',
      password: await hashPassword('Admin@123456'),
      full_name: 'Test Admin',
      role: 'admin',
      status: 'active',
    });
    adminId = admin.id;
    adminToken = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Create regular user
    const user = await User.create({
      email: 'user@test.com',
      password: await hashPassword('User@123456'),
      full_name: 'Test User',
      role: 'user',
      status: 'active',
    });
    userId = user.id;
    userToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create another test user
    const testUser = await User.create({
      email: 'test@test.com',
      password: await hashPassword('Test@123456'),
      full_name: 'Another User',
      role: 'user',
      status: 'active',
    });
    testUserId = testUser.id;
  });

  describe('GET /api/users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.meta.pagination.currentPage).toBe(1);
      expect(response.body.meta.pagination.limit).toBe(2);
    });

    it('should support filtering by role', async () => {
      const response = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID as admin', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(userId);
    });

    it('should get own profile as regular user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.user.id).toBe(userId);
    });

    it('should fail when user tries to access another user', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid UUID', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user as admin', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          full_name: 'Updated Name',
          status: 'inactive',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.full_name).toBe('Updated Name');
      expect(response.body.data.user.status).toBe('inactive');
    });

    it('should update own profile as user', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          full_name: 'My New Name',
        })
        .expect(200);

      expect(response.body.data.user.full_name).toBe('My New Name');
    });

    it('should prevent user from changing own role', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'admin',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id/password', () => {
    it('should change own password', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          current_password: 'User@123456',
          new_password: 'NewPass@123456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed successfully');
    });

    it('should fail with incorrect current password', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          current_password: 'WrongPassword@123',
          new_password: 'NewPass@123456',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should prevent changing another user password', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          current_password: 'User@123456',
          new_password: 'NewPass@123456',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('User Activation/Deactivation', () => {
    it('should deactivate user as admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('inactive');
    });

    it('should activate user as admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('active');
    });

    it('should prevent admin from deactivating self', async () => {
      const response = await request(app)
        .patch(`/api/users/${adminId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}/deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user statistics as admin', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('adminCount');
      expect(response.body.data).toHaveProperty('userCount');
      expect(response.body.data).toHaveProperty('activeCount');
      expect(response.body.data).toHaveProperty('inactiveCount');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
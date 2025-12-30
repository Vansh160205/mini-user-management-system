/**
 * User Model
 * 
 * Handles all database operations for the users table.
 * Uses repository pattern for clean data access.
 */

const { query, transaction } = require('../database');

/**
 * User Model - Database Operations
 */
const User = {
  /**
   * Create a new user
   * @param {object} userData - User data object
   * @param {string} userData.email - User email
   * @param {string} userData.password - Hashed password
   * @param {string} userData.full_name - User's full name
   * @param {string} [userData.role='user'] - User role (admin/user)
   * @param {string} [userData.status='active'] - User status (active/inactive)
   * @returns {Promise<object>} Created user (without password)
   */
  async create({ email, password, full_name, role = 'user', status = 'active' }) {
    const sql = `
      INSERT INTO users (email, password, full_name, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, status, created_at, updated_at
    `;
    
    const result = await query(sql, [email, password, full_name, role, status]);
    return result.rows[0];
  },

  /**
   * Find user by ID
   * @param {string} id - User UUID
   * @param {boolean} [includePassword=false] - Include password in result
   * @returns {Promise<object|null>} User object or null
   */
  async findById(id, includePassword = false) {
    const fields = includePassword
      ? '*'
      : 'id, email, full_name, role, status, last_login, created_at, updated_at';
    
    const sql = `SELECT ${fields} FROM users WHERE id = $1`;
    const result = await query(sql, [id]);
    
    return result.rows[0] || null;
  },

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} [includePassword=false] - Include password in result
   * @returns {Promise<object|null>} User object or null
   */
  async findByEmail(email, includePassword = false) {
    const fields = includePassword
      ? '*'
      : 'id, email, full_name, role, status, last_login, created_at, updated_at';
    
    const sql = `SELECT ${fields} FROM users WHERE email = $1`;
    const result = await query(sql, [email.toLowerCase()]);
    
    return result.rows[0] || null;
  },

  /**
   * Get all users with pagination
   * @param {object} options - Pagination options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Items per page
   * @param {string} [options.role] - Filter by role
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.search] - Search by name or email
   * @param {string} [options.sortBy='created_at'] - Sort field
   * @param {string} [options.sortOrder='DESC'] - Sort order (ASC/DESC)
   * @returns {Promise<object>} Paginated users with metadata
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // Build WHERE conditions
    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['created_at', 'updated_at', 'email', 'full_name', 'role', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countSql = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await query(countSql, params);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Get paginated users
    const usersSql = `
      SELECT id, email, full_name, role, status, last_login, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const usersResult = await query(usersSql, [...params, limit, offset]);

    return {
      users: usersResult.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Update user by ID
   * @param {string} id - User UUID
   * @param {object} updateData - Fields to update
   * @returns {Promise<object|null>} Updated user or null
   */
  async update(id, updateData) {
    const allowedFields = ['email', 'full_name', 'password', 'role', 'status'];
    const updates = [];
    const params = [];

    // Build dynamic SET clause
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        params.push(updateData[key]);
        updates.push(`${key} = $${params.length}`);
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, email, full_name, role, status, last_login, created_at, updated_at
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  },

  /**
   * Delete user by ID
   * @param {string} id - User UUID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const sql = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  },

  /**
   * Update user's last login timestamp
   * @param {string} id - User UUID
   * @returns {Promise<object|null>} Updated user or null
   */
  async updateLastLogin(id) {
    const sql = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, full_name, role, status, last_login, created_at, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Activate user
   * @param {string} id - User UUID
   * @returns {Promise<object|null>} Updated user or null
   */
  async activate(id) {
    return this.update(id, { status: 'active' });
  },

  /**
   * Deactivate user
   * @param {string} id - User UUID
   * @returns {Promise<object|null>} Updated user or null
   */
  async deactivate(id) {
    return this.update(id, { status: 'inactive' });
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {string} [excludeId] - User ID to exclude (for updates)
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email, excludeId = null) {
    let sql = `SELECT id FROM users WHERE email = $1`;
    const params = [email.toLowerCase()];

    if (excludeId) {
      sql += ` AND id != $2`;
      params.push(excludeId);
    }

    const result = await query(sql, params);
    return result.rowCount > 0;
  },

  /**
   * Count users by role
   * @returns {Promise<object>} Count by role
   */
  async countByRole() {
    const sql = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;

    const result = await query(sql);
    
    const counts = { admin: 0, user: 0 };
    result.rows.forEach((row) => {
      counts[row.role] = parseInt(row.count, 10);
    });

    return counts;
  },

  /**
   * Count users by status
   * @returns {Promise<object>} Count by status
   */
  async countByStatus() {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM users
      GROUP BY status
    `;

    const result = await query(sql);
    
    const counts = { active: 0, inactive: 0 };
    result.rows.forEach((row) => {
      counts[row.status] = parseInt(row.count, 10);
    });

    return counts;
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<object>} Dashboard stats
   */
  async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
        COUNT(*) FILTER (WHERE role = 'user') as user_count,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
        COUNT(*) FILTER (WHERE last_login >= CURRENT_DATE - INTERVAL '24 hours') as active_today
      FROM users
    `;

    const result = await query(sql);
    const stats = result.rows[0];

    return {
      totalUsers: parseInt(stats.total_users, 10),
      adminCount: parseInt(stats.admin_count, 10),
      userCount: parseInt(stats.user_count, 10),
      activeCount: parseInt(stats.active_count, 10),
      inactiveCount: parseInt(stats.inactive_count, 10),
      newUsersThisWeek: parseInt(stats.new_users_week, 10),
      activeToday: parseInt(stats.active_today, 10),
    };
  },
};

module.exports = User;
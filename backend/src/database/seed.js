/**
 * Database Seed Script
 * 
 * Seeds the database with initial data:
 * - Default admin user
 * - Optional test users
 * 
 * Run with: npm run db:seed
 */

require('dotenv').config();

const { pool, connectDB } = require('../config/db');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');

// Seed data configuration
const seedData = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin@123',
    full_name: 'System Administrator',
    role: 'admin',
    status: 'active',
  },
  testUsers: [
    {
      email: 'john.doe@example.com',
      password: 'User@123',
      full_name: 'John Doe',
      role: 'user',
      status: 'active',
    },
    {
      email: 'jane.smith@example.com',
      password: 'User@123',
      full_name: 'Jane Smith',
      role: 'user',
      status: 'active',
    },
    {
      email: 'bob.wilson@example.com',
      password: 'User@123',
      full_name: 'Bob Wilson',
      role: 'user',
      status: 'inactive',
    },
  ],
};

/**
 * Seed admin user
 */
const seedAdminUser = async () => {
  console.log('\n📌 Seeding admin user...');

  try {
    // Check if admin already exists
    const existingAdmin = await User.findByEmail(seedData.admin.email);

    if (existingAdmin) {
      console.log('   ⚠️  Admin user already exists');
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await hashPassword(seedData.admin.password);

    // Create admin user
    const admin = await User.create({
      ...seedData.admin,
      password: hashedPassword,
    });

    console.log('   ✅ Admin user created successfully');
    console.log(`      Email: ${admin.email}`);
    console.log(`      Password: ${seedData.admin.password}`);
    console.log(`      ID: ${admin.id}`);

    return admin;
  } catch (error) {
    console.error('   ❌ Failed to seed admin user:', error.message);
    throw error;
  }
};

/**
 * Seed test users (optional)
 */
const seedTestUsers = async () => {
  console.log('\n📌 Seeding test users...');

  const results = {
    created: [],
    skipped: [],
    failed: [],
  };

  for (const userData of seedData.testUsers) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);

      if (existingUser) {
        console.log(`   ⚠️  User ${userData.email} already exists`);
        results.skipped.push(userData.email);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      console.log(`   ✅ Created user: ${user.email} (${user.role}, ${user.status})`);
      results.created.push(user.email);
    } catch (error) {
      console.error(`   ❌ Failed to create user ${userData.email}:`, error.message);
      results.failed.push(userData.email);
    }
  }

  // Summary
  console.log('\n📊 Test Users Summary:');
  console.log(`   Created: ${results.created.length}`);
  console.log(`   Skipped: ${results.skipped.length}`);
  console.log(`   Failed: ${results.failed.length}`);

  return results;
};

/**
 * Main seed function
 */
const seed = async () => {
  console.log('🌱 Starting database seeding...\n');
  console.log('================================================');

  try {
    // Connect to database
    await connectDB();

    // Seed admin user
    await seedAdminUser();

    // Seed test users (optional - based on environment)
    if (process.env.NODE_ENV !== 'production' || process.argv.includes('--with-test-users')) {
      await seedTestUsers();
    }

    console.log('\n================================================');
    console.log('✅ Database seeding completed successfully!\n');

    // Display login credentials
    console.log('🔑 Default Credentials:');
    console.log('================================================');
    console.log('Admin Account:');
    console.log(`  Email: ${seedData.admin.email}`);
    console.log(`  Password: ${seedData.admin.password}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('\nTest User Accounts:');
      seedData.testUsers.forEach(user => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: ${user.password}`);
        console.log(`  Status: ${user.status}\n`);
      });
    }
    console.log('================================================\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
};

/**
 * Reset database (optional - dangerous!)
 * Clears all users from the database
 */
const reset = async () => {
  console.log('⚠️  WARNING: This will delete all users from the database!');
  console.log('   Press Ctrl+C to cancel...\n');

  // Give user time to cancel
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    await connectDB();

    console.log('🗑️  Deleting all users...');
    const result = await pool.query('DELETE FROM users');
    console.log(`   Deleted ${result.rowCount} users`);

    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);

// Run appropriate function based on arguments
if (args.includes('--reset')) {
  reset().then(() => seed());
} else if (require.main === module) {
  seed();
}

module.exports = {
  seed,
  reset,
  seedAdminUser,
  seedTestUsers,
};
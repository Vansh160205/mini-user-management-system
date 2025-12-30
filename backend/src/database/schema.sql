-- =============================================
-- Mini User Management System - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

-- User role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User status enum
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- USERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES
-- =============================================

-- Index on email for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index on status for filtering active/inactive users
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Composite index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS
-- =============================================

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA (Optional - Default Admin User)
-- =============================================

-- Note: Password should be hashed in production
-- This is a placeholder - actual seeding should be done via application
-- INSERT INTO users (email, password, full_name, role, status)
-- VALUES ('admin@example.com', 'hashed_password_here', 'System Admin', 'admin', 'active')
-- ON CONFLICT (email) DO NOTHING;
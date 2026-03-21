-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'inactive')),
  generations_used INTEGER DEFAULT 0,
  generations_limit INTEGER DEFAULT 3,
  preferences JSONB DEFAULT '{}',
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if upgrading from older schema
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code TEXT NOT NULL,
  referred_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'paid')),
  commission_brl NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS referrals_code_idx ON referrals(referral_code);
-- FK: referral_code must match an existing user's referral_code (cascade on user delete)
ALTER TABLE referrals ADD CONSTRAINT IF NOT EXISTS referrals_code_fk
  FOREIGN KEY (referral_code) REFERENCES users(referral_code) ON DELETE CASCADE;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('generating', 'completed', 'error', 'draft')),
  prompt TEXT NOT NULL,
  generated_code JSONB,
  tech_stack TEXT[],
  features TEXT[],
  preview_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (AI chat history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_project_id_idx ON messages(project_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_project_user_idx ON messages(project_id, user_id);
CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users(stripe_customer_id);
-- Note: users_email_idx removed — the UNIQUE constraint on email already creates an index

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Contact requests table (used by /api/contact and /api/admin/stats)
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  plan TEXT DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contact_requests_email_idx ON contact_requests(email);
CREATE INDEX IF NOT EXISTS contact_requests_created_at_idx ON contact_requests(created_at DESC);
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
-- Only service-role (backend) can read; anyone can insert (public contact form)
CREATE POLICY "contact_requests_insert" ON contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_requests_admin_read" ON contact_requests FOR SELECT USING (false);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- NOTE: The backend exclusively uses the service-role key (bypasses RLS).
-- These policies protect against accidental direct anon-key access.

-- Users: can only read/update their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Projects: scoped to owner via users.clerk_id join
CREATE POLICY "projects_select_own" ON projects
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1)
  );
CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1)
  );
CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1)
  );
CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1)
  );

-- Messages: scoped to owner
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1)
  );
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1)
  );

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

-- Projects: primary lookup by owner (used in all dashboard queries)
CREATE INDEX IF NOT EXISTS idx_projects_user_clerk_id ON projects(user_clerk_id);
-- Projects: ordered listing by last modified
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
-- Users: ordered listing / admin queries
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
-- Version history: efficient per-project version listing
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id, version_number DESC);
-- Rate limits: efficient expiry cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

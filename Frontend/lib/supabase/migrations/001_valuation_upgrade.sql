-- NeuroCode AI — Valuation Upgrade Migration
-- Run this in your Supabase SQL Editor

-- ─── GitHub Integration ───────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo_name TEXT;

-- ─── Version History ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  generated_code JSONB NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS project_versions_project_id_idx ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS project_versions_number_idx ON project_versions(project_id, version_number);

-- ─── Referral Program ─────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_clerk_id TEXT NOT NULL,
  referred_clerk_id TEXT,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'paid')),
  commission_brl DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  FOREIGN KEY (referral_code) REFERENCES users(referral_code)
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals(referrer_clerk_id);
CREATE INDEX IF NOT EXISTS referrals_code_idx ON referrals(referral_code);

-- ─── API Keys ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT,
  last_used_at TIMESTAMPTZ,
  requests_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_hash_idx ON api_keys(key_hash);

-- ─── Templates Marketplace ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  preview_html TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS templates_type_idx ON templates(type);
CREATE INDEX IF NOT EXISTS templates_featured_idx ON templates(is_featured);

-- ─── Showcase Gallery ─────────────────────────────────────────────────────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS showcase_slug TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS showcase_screenshot_url TEXT;

CREATE TABLE IF NOT EXISTS showcase_votes (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_clerk_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_clerk_id)
);

-- ─── Roadmap Votes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_key TEXT NOT NULL,
  user_clerk_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (feature_key, user_clerk_id)
);

CREATE INDEX IF NOT EXISTS roadmap_votes_feature_idx ON roadmap_votes(feature_key);

-- ─── RLS Policies for new tables ──────────────────────────────────────────────
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_versions_owner" ON project_versions FOR ALL USING (true);
CREATE POLICY "referrals_owner" ON referrals FOR ALL USING (true);
CREATE POLICY "api_keys_owner" ON api_keys FOR ALL USING (true);
CREATE POLICY "templates_public_read" ON templates FOR SELECT USING (true);
CREATE POLICY "showcase_votes_all" ON showcase_votes FOR ALL USING (true);
CREATE POLICY "roadmap_votes_all" ON roadmap_votes FOR ALL USING (true);

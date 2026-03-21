-- Settings: persist user preferences (dashboard /api/user/preferences)
-- Run in Supabase SQL Editor if the column is missing.

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

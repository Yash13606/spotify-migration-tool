-- Spotify Migration Tool Database Schema
-- PostgreSQL 14+

-- Users table (stores Spotify account information)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  display_name VARCHAR(255),
  profile_image_url TEXT,
  account_type VARCHAR(10) CHECK (account_type IN ('old', 'new')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_spotify_id ON users(spotify_id);
CREATE INDEX idx_users_account_type ON users(account_type);

-- Sessions table (stores OAuth tokens securely)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Migration history (tracks all migrations)
CREATE TABLE IF NOT EXISTS migration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_account_id UUID REFERENCES users(id) ON DELETE CASCADE,
  new_account_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_tracks INTEGER NOT NULL,
  tracks_added INTEGER DEFAULT 0,
  tracks_skipped INTEGER DEFAULT 0,
  tracks_failed INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('in_progress', 'completed', 'failed')) DEFAULT 'in_progress',
  error_log JSONB,
  duration_seconds INTEGER
);

CREATE INDEX idx_migration_history_status ON migration_history(status);
CREATE INDEX idx_migration_history_started_at ON migration_history(started_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

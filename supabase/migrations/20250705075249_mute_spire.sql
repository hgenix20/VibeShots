/*
  # Complete Vibe Shots Database Schema

  1. New Tables
    - `users` - User profiles and preferences
    - `ideas` - Video ideas submitted by users
    - `scripts` - AI-generated scripts from ideas
    - `media` - Generated audio/video files with storage references
    - `schedules` - TikTok upload scheduling and status
    - `analytics` - TikTok performance metrics
    - `user_preferences` - User-specific settings and optimal posting times

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for analytics dashboard

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for analytics and scheduling
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS scripts CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  optimal_post_times jsonb DEFAULT '["09:00", "15:00", "21:00"]'::jsonb,
  timezone text DEFAULT 'UTC',
  content_style text DEFAULT 'engaging',
  auto_schedule boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'script_generated', 'media_ready', 'scheduled', 'published', 'failed')),
  priority integer DEFAULT 1,
  target_audience text,
  keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0
);

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  hook text,
  call_to_action text,
  estimated_duration integer, -- in seconds
  ai_model text DEFAULT 'openai-gpt-4',
  generation_prompt text,
  created_at timestamptz DEFAULT now()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid REFERENCES scripts(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('audio', 'video')),
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'uploaded', 'deleted', 'failed')),
  file_path text, -- Supabase Storage path
  file_size bigint,
  duration integer, -- in seconds
  format text,
  ai_model text,
  generation_params jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'published', 'failed', 'cancelled')),
  tiktok_video_id text,
  tiktok_share_url text,
  upload_attempt_count integer DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES schedules(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tiktok_video_id text NOT NULL,
  views bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  engagement_rate decimal(5,2),
  revenue decimal(10,2) DEFAULT 0,
  fetch_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ideas
CREATE POLICY "Users can manage their own ideas"
  ON ideas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for scripts
CREATE POLICY "Users can manage their own scripts"
  ON scripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for media
CREATE POLICY "Users can manage their own media"
  ON media
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for schedules
CREATE POLICY "Users can manage their own schedules"
  ON schedules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics
CREATE POLICY "Users can view their own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS ideas_user_id_status_idx ON ideas(user_id, status);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS scripts_idea_id_idx ON scripts(idea_id);
CREATE INDEX IF NOT EXISTS media_status_type_idx ON media(status, type);
CREATE INDEX IF NOT EXISTS schedules_scheduled_time_idx ON schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS schedules_status_idx ON schedules(status);
CREATE INDEX IF NOT EXISTS analytics_user_id_fetch_date_idx ON analytics(user_id, fetch_date DESC);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
/*
  # Create ideas table for Vibe Shots

  1. New Tables
    - `ideas`
      - `id` (uuid, primary key)
      - `text` (text, the idea content)
      - `status` (text, enum: queued, processing, completed, failed)
      - `created_at` (timestamp)
      - `processed_at` (timestamp, nullable)
      - `video_url` (text, nullable)
      - `error` (text, nullable)

  2. Security
    - Enable RLS on `ideas` table
    - Add policy for authenticated users to manage their own ideas
*/

CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  video_url text,
  error text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ideas"
  ON ideas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS ideas_user_id_idx ON ideas(user_id);
CREATE INDEX IF NOT EXISTS ideas_status_idx ON ideas(status);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas(created_at DESC);
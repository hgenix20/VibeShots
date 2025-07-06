/*
  # Create media storage bucket and policies

  1. Storage Setup
    - Create media bucket for video/audio files
    - Set appropriate file size limits and MIME types
  
  2. Security
    - Bucket is private by default
    - Users can access their own media files
    - Service role has full access for processing
*/

-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS policies for storage.objects need to be created via Supabase Dashboard
-- or using the Supabase CLI, as they require superuser privileges.
-- 
-- The following policies should be created manually:
--
-- 1. "Users can view their own media files" (SELECT)
--    Target: authenticated users
--    Policy: bucket_id = 'media' AND auth.uid()::text IN (
--      SELECT user_id::text FROM media WHERE file_path = storage.objects.name
--    )
--
-- 2. "Service role can manage media files" (ALL)
--    Target: service_role
--    Policy: bucket_id = 'media'
--
-- 3. "Users can upload media files" (INSERT)
--    Target: authenticated users  
--    Policy: bucket_id = 'media' AND auth.uid()::text IN (
--      SELECT user_id::text FROM media WHERE file_path = storage.objects.name
--    )

-- Update media table to include file_path column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE media ADD COLUMN file_path text;
  END IF;
END $$;

-- Create index on file_path for better performance
CREATE INDEX IF NOT EXISTS media_file_path_idx ON media(file_path);

-- Create index on user_id for RLS policy performance
CREATE INDEX IF NOT EXISTS media_user_id_idx ON media(user_id);
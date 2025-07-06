/*
  # Create media storage bucket

  1. Storage Bucket
    - Creates a 'media' bucket for storing generated videos
    - Sets up proper RLS policies for user access
    - Configures file size and type restrictions

  2. Security
    - Users can only access their own media files
    - Proper file type validation
    - Size limits for uploads
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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own media files
CREATE POLICY "Users can view their own media files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'videos' AND
  auth.uid()::text = (
    SELECT user_id::text FROM media 
    WHERE file_path = storage.objects.name
  )
);

-- Policy for service role to upload media files
CREATE POLICY "Service role can upload media files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'media');

-- Policy for service role to update media files
CREATE POLICY "Service role can update media files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'media');

-- Policy for service role to delete media files
CREATE POLICY "Service role can delete media files"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'media');
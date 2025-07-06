/*
  # Temporarily disable RLS for testing

  This migration temporarily disables Row Level Security on the ideas table
  to allow testing without authentication. This should be re-enabled once
  proper authentication is implemented.
  
  1. Changes
    - Disable RLS on ideas table
    - Drop the existing policy
    - Add a temporary policy that allows all operations
  
  2. Security Note
    - This is for development/testing only
    - Re-enable RLS with proper policies once auth is implemented
*/

-- Disable RLS temporarily for testing
ALTER TABLE ideas DISABLE ROW LEVEL SECURITY;

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can manage their own ideas" ON ideas;

-- Create a temporary permissive policy for testing
-- This allows all operations without authentication
CREATE POLICY "Temporary allow all for testing"
  ON ideas
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Re-enable RLS with the permissive policy
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
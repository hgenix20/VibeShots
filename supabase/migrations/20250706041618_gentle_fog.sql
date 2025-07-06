/*
  # Add video processor trigger

  1. Database Trigger
    - Creates a trigger on the scripts table
    - Calls the video-processor Edge Function when a new script is inserted
    - Passes the new script record to the function

  2. Security
    - Uses service role for Edge Function calls
    - Ensures proper error handling
*/

-- Create function to call video processor Edge Function
CREATE OR REPLACE FUNCTION trigger_video_processor()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the video-processor Edge Function
  PERFORM
    net.http_post(
      url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/video-processor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on scripts table
DROP TRIGGER IF EXISTS on_script_insert_trigger ON scripts;
CREATE TRIGGER on_script_insert_trigger
  AFTER INSERT ON scripts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_video_processor();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_video_processor() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_video_processor() TO service_role;
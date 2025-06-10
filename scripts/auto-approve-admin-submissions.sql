-- Function to auto-approve podcast submissions from admins
CREATE OR REPLACE FUNCTION auto_approve_admin_submissions()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the submitter is an admin
  SELECT is_admin INTO is_admin FROM profiles WHERE id = NEW.submitter_id;
  
  -- If submitter is an admin, auto-approve the podcast
  IF is_admin = TRUE THEN
    NEW.status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS auto_approve_admin_podcast_trigger ON podcasts;

-- Create the trigger to run before insert
CREATE TRIGGER auto_approve_admin_podcast_trigger
BEFORE INSERT ON podcasts
FOR EACH ROW
EXECUTE FUNCTION auto_approve_admin_submissions();

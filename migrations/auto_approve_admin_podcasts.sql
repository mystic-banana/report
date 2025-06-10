-- Migration to auto-approve podcasts submitted by admin users
-- This ensures that when an admin adds a podcast, it's automatically approved

-- First, create a function to check if a user is an admin and set status accordingly
CREATE OR REPLACE FUNCTION public.handle_podcast_submission()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the submitter is an admin
  SELECT is_admin INTO is_admin 
  FROM public.profiles 
  WHERE id = NEW.submitter_id;
  
  -- If submitter is an admin, auto-approve the podcast
  IF is_admin = TRUE THEN
    NEW.status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run before insert on podcasts
DROP TRIGGER IF EXISTS auto_approve_admin_podcasts ON public.podcasts;
CREATE TRIGGER auto_approve_admin_podcasts
BEFORE INSERT ON public.podcasts
FOR EACH ROW
EXECUTE FUNCTION public.handle_podcast_submission();

-- Also add a comment to explain the trigger
COMMENT ON TRIGGER auto_approve_admin_podcasts ON public.podcasts IS 'Automatically approves podcasts submitted by admin users';

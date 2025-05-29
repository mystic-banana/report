-- supabase/migrations/20250524155800_add_is_admin_to_profiles.sql

ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.is_admin IS 'Flags if the user has administrative privileges.';

-- Optional: If you want to grant update permission on is_admin only to service_role or specific admin management functions later.
-- For now, existing RLS for profile updates will apply. If only admins should change other admins, RLS needs refinement.
-- Example: Update RLS for profiles if needed, or handle admin status changes via a secure edge function.

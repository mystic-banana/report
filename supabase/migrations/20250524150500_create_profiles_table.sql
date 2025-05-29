-- supabase/migrations/20250524150500_create_profiles_table.sql
-- The timestamp in the filename helps with ordering if using Supabase CLI migrate command.

-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, -- Store email here for easier access if needed, synced from auth.users
  name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  preferences JSONB,
  saved_content JSONB, -- Storing as JSONB array of IDs, can be normalized further if needed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment explaining the purpose of the profiles table
COMMENT ON TABLE public.profiles IS 'Stores public profile information for users, extending auth.users.';

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on profile change
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_profile_update();

-- Enable Row Level Security for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own profile
CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can insert their own profile (initially)
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Function to handle new user sign-ups and create a profile entry
-- This function is called by a trigger on the auth.users table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, preferences, saved_content)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'name', -- Assumes 'name' is passed in raw_user_meta_data during signup
    NEW.raw_user_meta_data->>'avatar_url', -- Assumes 'avatar_url' might be passed
    '{"interests": [], "notificationSettings": {"dailyHoroscope": true, "dailyTarot": true, "newContent": true, "premiumOffers": true}}', -- Default preferences
    '[]' -- Default empty saved content
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on new auth.users entry
-- This ensures a profile is created automatically when a user signs up.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Note: If you already have users in auth.users without corresponding profiles,
-- you might need to backfill them manually or with a script.
-- Example to backfill a specific user (replace with actual user ID and details):
-- INSERT INTO public.profiles (id, email, name) 
-- SELECT id, email, raw_user_meta_data->>'name' FROM auth.users WHERE id = 'your-user-id-here'
-- ON CONFLICT (id) DO NOTHING;

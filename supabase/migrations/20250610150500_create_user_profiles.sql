-- Creates the user_profiles table and sets up basic RLS.
-- Review and adapt RLS policies to your application's security requirements.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
  -- Add any other columns your application expects, e.g.:
  -- subscription_status TEXT,
  -- plan_id TEXT
);

-- Optional: Add a unique constraint if usernames should be unique
-- ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);

-- Optional: Add a check constraint for username length
-- ALTER TABLE public.user_profiles ADD CONSTRAINT username_length CHECK (char_length(username) >= 3);

-- Enable Row Level Security (RLS) - IMPORTANT for Supabase
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies:

-- Allow users to read their own profile
CREATE POLICY "Allow individual user read access"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow individual user update access"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (often handled by a trigger on auth.users instead)
-- If you create profiles via a trigger, you might not need this INSERT policy.
-- If users create their own profiles directly after signup, this policy is needed.
CREATE POLICY "Allow individual user insert access"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure authenticated users can select from auth.users (usually default, but good to be aware)
-- This isn't directly for user_profiles but often related.
-- Ensure appropriate policies exist on auth.users if you query it directly.

COMMENT ON TABLE public.user_profiles IS 'Stores public profile information for each user, extending auth.users.';
COMMENT ON POLICY "Allow individual user read access" ON public.user_profiles IS 'Users can read their own profile information.';
COMMENT ON POLICY "Allow individual user update access" ON public.user_profiles IS 'Users can update their own profile information.';
COMMENT ON POLICY "Allow individual user insert access" ON public.user_profiles IS 'Users can insert their own profile information.';

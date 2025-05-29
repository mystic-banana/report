-- Create podcast_categories table
CREATE TABLE IF NOT EXISTS public.podcast_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.podcast_categories ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage categories
CREATE POLICY "Allow admins to manage podcast categories" 
  ON public.podcast_categories
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Add a foreign key to the podcasts table
ALTER TABLE public.podcasts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.podcast_categories(id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_podcast_categories_updated_at
BEFORE UPDATE ON public.podcast_categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

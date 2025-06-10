-- Create the podcast_categories table
CREATE TABLE IF NOT EXISTS public.podcast_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial categories
INSERT INTO public.podcast_categories (name, description)
VALUES 
  ('Technology', 'Tech-related podcasts'),
  ('Business', 'Business and entrepreneurship'),
  ('Science', 'Science and research'),
  ('Entertainment', 'Entertainment and pop culture'),
  ('Health', 'Health and wellness');

-- Update the podcasts table to reference categories
ALTER TABLE public.podcasts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.podcast_categories(id);

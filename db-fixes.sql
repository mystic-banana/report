-- This script addresses both podcast loading issues and sets up playlist tables

-- 1. Fix the categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Insert default categories if they don't exist
INSERT INTO categories (id, name, description) 
VALUES 
  ('c1e25edf-ec02-4b16-88a2-ad23c2986eec', 'Technology', 'Technology podcasts featuring the latest in tech news'),
  ('d5f38c47-74b1-48b1-a82f-3d5f1162e11a', 'Business', 'Business and entrepreneurship podcasts'),
  ('9a6b23d5-4c81-4fc0-adbc-54112c7d68c6', 'Science', 'Science, research, and discovery podcasts'),
  ('f4a9e1d3-bd56-4174-b5c6-32e4b4d9c040', 'Entertainment', 'Entertainment and pop culture podcasts')
ON CONFLICT (name) DO NOTHING;

-- 3. Make sure podcasts have status field populated with 'approved' for existing records
UPDATE podcasts
SET status = 'approved'
WHERE status IS NULL;

-- 4. Ensure podcasts have category_id values from the text category field
UPDATE podcasts
SET 
  category_id = (SELECT id FROM categories WHERE categories.name = podcasts.category)
WHERE 
  category_id IS NULL AND category IS NOT NULL;

-- 5. Insert sample podcasts if none exist
INSERT INTO podcasts (name, category_id, feed_url, description, image_url, author, status)
SELECT 
  'Tech Talk Daily', 'c1e25edf-ec02-4b16-88a2-ad23c2986eec', 
  'https://feeds.example.com/techtalkdaily', 
  'Daily tech news and industry analysis', 
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f', 
  'Sarah Johnson', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM podcasts LIMIT 1);

INSERT INTO podcasts (name, category_id, feed_url, description, image_url, author, status)
SELECT
  'Future Science', '9a6b23d5-4c81-4fc0-adbc-54112c7d68c6',
  'https://feeds.example.com/futurescience', 
  'Exploring the frontiers of scientific research', 
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31', 
  'Dr. Robert Chen', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM podcasts LIMIT 2);

-- 6. Create podcast playlists tables
CREATE TABLE IF NOT EXISTS podcast_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Create podcast playlist episodes table
CREATE TABLE IF NOT EXISTS podcast_playlist_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES podcast_playlists(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, episode_id)
);

-- 8. Create episodes table if it doesn't exist
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  image_url TEXT,
  pub_date TIMESTAMP WITH TIME ZONE,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Add RLS policies for podcast playlists
ALTER TABLE podcast_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlists" 
  ON podcast_playlists FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" 
  ON podcast_playlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
  ON podcast_playlists FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
  ON podcast_playlists FOR DELETE 
  USING (auth.uid() = user_id);

-- 10. Add RLS policies for playlist episodes
ALTER TABLE podcast_playlist_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlist episodes" 
  ON podcast_playlist_episodes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert episodes to their playlists" 
  ON podcast_playlist_episodes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete episodes from their playlists" 
  ON podcast_playlist_episodes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

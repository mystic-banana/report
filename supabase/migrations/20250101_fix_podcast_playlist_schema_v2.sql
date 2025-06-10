-- Fix podcast playlist schema issues (v2)
-- Drop existing policies first to avoid conflicts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own playlists" ON podcast_playlists;
DROP POLICY IF EXISTS "Users can create their own playlists" ON podcast_playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON podcast_playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON podcast_playlists;
DROP POLICY IF EXISTS "Users can view episodes in their playlists" ON podcast_playlist_episodes;
DROP POLICY IF EXISTS "Users can add episodes to their playlists" ON podcast_playlist_episodes;
DROP POLICY IF EXISTS "Users can remove episodes from their playlists" ON podcast_playlist_episodes;
DROP POLICY IF EXISTS "Anyone can view published reviews" ON podcast_reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON podcast_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON podcast_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON podcast_reviews;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Note: Tables are assumed to already exist, only creating indexes and policies

-- Add podcast_id column to podcast_playlist_episodes if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'podcast_playlist_episodes' 
                   AND column_name = 'podcast_id') THEN
        ALTER TABLE podcast_playlist_episodes ADD COLUMN podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE;
    END IF;
END $;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_playlist_id ON podcast_playlist_episodes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_episode_id ON podcast_playlist_episodes(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_podcast_id ON podcast_playlist_episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlists_user_id ON podcast_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_podcast_id ON podcast_reviews(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_user_id ON podcast_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_status ON podcast_reviews(status);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to increment review helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE podcast_reviews 
  SET helpful_count = helpful_count + 1,
      updated_at = NOW()
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for all podcast-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_playlist_episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Grant necessary permissions
GRANT ALL ON podcast_playlists TO authenticated;
GRANT ALL ON podcast_playlist_episodes TO authenticated;
GRANT ALL ON podcast_reviews TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Enable RLS
ALTER TABLE podcast_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_playlist_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for podcast_playlists
CREATE POLICY "Users can view their own playlists" ON podcast_playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON podcast_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON podcast_playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON podcast_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for podcast_playlist_episodes
CREATE POLICY "Users can view episodes in their playlists" ON podcast_playlist_episodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = podcast_playlist_episodes.playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add episodes to their playlists" ON podcast_playlist_episodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = podcast_playlist_episodes.playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove episodes from their playlists" ON podcast_playlist_episodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = podcast_playlist_episodes.playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

-- Create RLS policies for podcast_reviews
CREATE POLICY "Anyone can view published reviews" ON podcast_reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create their own reviews" ON podcast_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON podcast_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON podcast_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

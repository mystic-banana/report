-- Fix podcast playlist schema issues

-- Create podcast_playlists table if it doesn't exist
CREATE TABLE IF NOT EXISTS podcast_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  episode_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create podcast_playlist_episodes table with proper schema
CREATE TABLE IF NOT EXISTS podcast_playlist_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES podcast_playlists(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, episode_id)
);

-- Create podcast_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS podcast_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- Create review_reports table for reporting functionality
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES podcast_reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, reporter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_playlists_user_id ON podcast_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_playlist_id ON podcast_playlist_episodes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_episode_id ON podcast_playlist_episodes(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_podcast_id ON podcast_reviews(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_user_id ON podcast_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_status ON podcast_reviews(status);

-- Create function to increment helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE podcast_reviews 
  SET helpful_count = helpful_count + 1 
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE podcast_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_playlist_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for podcast_playlists
CREATE POLICY "Users can view their own playlists" ON podcast_playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists" ON podcast_playlists
  FOR SELECT USING (is_public = true);

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
      WHERE id = playlist_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can add episodes to their playlists" ON podcast_playlist_episodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove episodes from their playlists" ON podcast_playlist_episodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for podcast_reviews
CREATE POLICY "Anyone can view published reviews" ON podcast_reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create reviews" ON podcast_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON podcast_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON podcast_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for review_reports
CREATE POLICY "Users can view their own reports" ON review_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON review_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_playlist_episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE review_reports;

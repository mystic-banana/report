-- Enhanced Podcast Features Migration
-- This migration adds support for analytics, reviews, downloads, and enhanced search

-- Create podcast analytics table
CREATE TABLE IF NOT EXISTS podcast_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  play_started_at TIMESTAMPTZ DEFAULT NOW(),
  play_ended_at TIMESTAMPTZ,
  duration_listened INTEGER DEFAULT 0, -- in seconds
  total_duration INTEGER DEFAULT 0, -- in seconds
  completion_percentage DECIMAL(5,2) DEFAULT 0.0,
  device_type VARCHAR(50),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create podcast reviews table
CREATE TABLE IF NOT EXISTS podcast_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title VARCHAR(200),
  content TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- Create podcast downloads table for offline listening
CREATE TABLE IF NOT EXISTS podcast_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  download_started_at TIMESTAMPTZ DEFAULT NOW(),
  download_completed_at TIMESTAMPTZ,
  file_size BIGINT,
  download_url TEXT,
  local_path TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'completed', 'failed', 'deleted')),
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  error_message TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- Create podcast search index table
CREATE TABLE IF NOT EXISTS podcast_search_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  content_type VARCHAR(20) CHECK (content_type IN ('podcast', 'episode')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  topics TEXT[],
  keywords TEXT[],
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create podcast playlists table
CREATE TABLE IF NOT EXISTS podcast_playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  episode_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create playlist episodes junction table
CREATE TABLE IF NOT EXISTS playlist_episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES podcast_playlists(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, episode_id),
  UNIQUE(playlist_id, position)
);

-- Create user podcast subscriptions table
CREATE TABLE IF NOT EXISTS podcast_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  notification_enabled BOOLEAN DEFAULT TRUE,
  auto_download BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, podcast_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_user_id ON podcast_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_episode_id ON podcast_analytics(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_created_at ON podcast_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_podcast_reviews_podcast_id ON podcast_reviews(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_user_id ON podcast_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_rating ON podcast_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_status ON podcast_reviews(status);

CREATE INDEX IF NOT EXISTS idx_podcast_downloads_user_id ON podcast_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_downloads_status ON podcast_downloads(status);

CREATE INDEX IF NOT EXISTS idx_podcast_search_content_type ON podcast_search_index(content_type);
CREATE INDEX IF NOT EXISTS idx_podcast_search_vector ON podcast_search_index USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_podcast_subscriptions_user_id ON podcast_subscriptions(user_id);

-- Create full-text search function
CREATE OR REPLACE FUNCTION update_podcast_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.topics, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.keywords, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
CREATE TRIGGER update_podcast_search_vector_trigger
  BEFORE INSERT OR UPDATE ON podcast_search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_podcast_search_vector();

-- Add realtime for analytics and reviews
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_downloads;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE playlist_episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE podcast_subscriptions;

-- Create view for podcast statistics
CREATE OR REPLACE VIEW podcast_stats AS
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT pa.user_id) as unique_listeners,
  COUNT(pa.id) as total_plays,
  AVG(pa.completion_percentage) as avg_completion_rate,
  SUM(pa.duration_listened) as total_listen_time,
  AVG(pr.rating) as average_rating,
  COUNT(pr.id) as review_count,
  COUNT(ps.id) as subscriber_count
FROM podcasts p
LEFT JOIN podcast_analytics pa ON p.id = pa.podcast_id
LEFT JOIN podcast_reviews pr ON p.id = pr.podcast_id AND pr.status = 'published'
LEFT JOIN podcast_subscriptions ps ON p.id = ps.podcast_id
GROUP BY p.id, p.name;

-- Create view for episode statistics
CREATE OR REPLACE VIEW episode_stats AS
SELECT 
  e.id,
  e.title,
  e.podcast_id,
  COUNT(DISTINCT pa.user_id) as unique_listeners,
  COUNT(pa.id) as total_plays,
  AVG(pa.completion_percentage) as avg_completion_rate,
  SUM(pa.duration_listened) as total_listen_time,
  COUNT(pd.id) as download_count
FROM episodes e
LEFT JOIN podcast_analytics pa ON e.id = pa.episode_id
LEFT JOIN podcast_downloads pd ON e.id = pd.episode_id AND pd.status = 'completed'
GROUP BY e.id, e.title, e.podcast_id;

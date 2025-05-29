-- Create podcast playlists table
CREATE TABLE IF NOT EXISTS podcast_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create podcast playlist episodes table for many-to-many relationship
CREATE TABLE IF NOT EXISTS podcast_playlist_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES podcast_playlists(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, episode_id)
);

-- Add RLS policies for podcast playlists
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

-- Add RLS policies for playlist episodes
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

CREATE POLICY "Users can insert their own playlist episodes" 
  ON podcast_playlist_episodes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own playlist episodes" 
  ON podcast_playlist_episodes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own playlist episodes" 
  ON podcast_playlist_episodes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM podcast_playlists 
      WHERE podcast_playlists.id = playlist_id 
      AND podcast_playlists.user_id = auth.uid()
    )
  );

import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const projectRef = Deno.env.get("SUPABASE_PROJECT_ID");
    const picaSecret = Deno.env.get("PICA_SECRET_KEY");
    const connectionKey = Deno.env.get("PICA_SUPABASE_CONNECTION_KEY");

    if (!projectRef || !picaSecret || !connectionKey) {
      throw new Error("Missing required environment variables");
    }

    const actionId = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";
    const url = `https://api.picaos.com/v1/passthrough/v1/projects/${projectRef}/database/query`;

    const sqlQuery = `-- Fix podcast playlist schema issues
-- Add missing columns and ensure proper relationships

-- First, let's check if the podcast_playlist_episodes table exists and fix it
CREATE TABLE IF NOT EXISTS podcast_playlist_episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES podcast_playlists(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_playlist_id ON podcast_playlist_episodes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_episode_id ON podcast_playlist_episodes(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playlist_episodes_podcast_id ON podcast_playlist_episodes(podcast_id);

-- Ensure podcast_playlists table exists with proper structure
CREATE TABLE IF NOT EXISTS podcast_playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user playlists
CREATE INDEX IF NOT EXISTS idx_podcast_playlists_user_id ON podcast_playlists(user_id);

-- Ensure podcast_reviews table exists with proper structure
CREATE TABLE IF NOT EXISTS podcast_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_podcast_id ON podcast_reviews(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_user_id ON podcast_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reviews_status ON podcast_reviews(status);

-- Create profiles table if it doesn't exist (needed for reviews)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
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

-- Create RLS policies for podcast_playlists
ALTER TABLE podcast_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlists" ON podcast_playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON podcast_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON podcast_playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON podcast_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for podcast_playlist_episodes
ALTER TABLE podcast_playlist_episodes ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE podcast_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews" ON podcast_reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create their own reviews" ON podcast_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON podcast_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON podcast_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-pica-secret": picaSecret,
        "x-pica-connection-key": connectionKey,
        "x-pica-action-id": actionId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sqlQuery }),
    });

    if (!response.ok) {
      throw new Error(`Database migration failed: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Database schema fixed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fixing database schema:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

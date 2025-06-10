-- Adds the description column to the podcast_playlists table.

ALTER TABLE public.podcast_playlists
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.podcast_playlists.description IS 'A textual description of the podcast playlist.';

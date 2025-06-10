-- Drop the unique constraint on the 'guid' column alone in the 'episodes' table.
-- The composite unique constraint on (podcast_id, guid) is sufficient and correct.
ALTER TABLE public.episodes
DROP CONSTRAINT IF EXISTS episodes_guid_key;

SELECT 'Dropped episodes_guid_key constraint if it existed.' AS status;

-- Add missing author_name column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_avatar TEXT;

-- Update existing articles with default author info
UPDATE articles 
SET author_name = 'Mystic Banana Team',
    author_avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
WHERE author_name IS NULL;

-- Enable realtime for articles table
ALTER PUBLICATION supabase_realtime ADD TABLE articles;

-- Add missing columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);
CREATE INDEX IF NOT EXISTS idx_articles_like_count ON articles(like_count);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

-- Enable realtime for articles
alter publication supabase_realtime add table articles;

-- Add missing columns to articles table if they don't exist
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);
CREATE INDEX IF NOT EXISTS idx_articles_like_count ON articles(like_count);
CREATE INDEX IF NOT EXISTS idx_articles_comment_count ON articles(comment_count);

-- Update existing articles to have default values
UPDATE articles 
SET 
  view_count = COALESCE(view_count, 0),
  like_count = COALESCE(like_count, 0),
  comment_count = COALESCE(comment_count, 0)
WHERE 
  view_count IS NULL 
  OR like_count IS NULL 
  OR comment_count IS NULL;

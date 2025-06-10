-- Add author_name and author_avatar columns to articles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author_name') THEN
        ALTER TABLE articles ADD COLUMN author_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author_avatar') THEN
        ALTER TABLE articles ADD COLUMN author_avatar TEXT;
    END IF;
    
    -- Update existing articles with default values if columns were just added
    UPDATE articles SET 
        author_name = 'Mystic Banana Team',
        author_avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=MysticBanana'
    WHERE author_name IS NULL;
    
    -- Add to realtime publication
    BEGIN
        ALTER publication supabase_realtime ADD TABLE articles;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Create daily_horoscopes table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_horoscopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zodiac_sign TEXT NOT NULL,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    love_score INTEGER,
    career_score INTEGER,
    health_score INTEGER,
    lucky_numbers INTEGER[] DEFAULT '{}',
    lucky_colors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(zodiac_sign, date)
);

-- Add to realtime publication
BEGIN;
    ALTER publication supabase_realtime ADD TABLE daily_horoscopes;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END;

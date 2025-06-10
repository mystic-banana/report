-- Create ads table if it doesn't exist
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    zone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ads
    SET impressions = impressions + 1
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment ad clicks
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ads
    SET clicks = clicks + 1
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample ads
INSERT INTO ads (title, description, image_url, target_url, zone)
VALUES 
('Premium Astrology Reports', 'Unlock your cosmic potential with detailed birth chart analysis', 'https://images.unsplash.com/photo-1518537018447-c4431971ea3e?w=800&q=80', '/plans', 'magazine-header'),
('Personalized Horoscopes', 'Daily insights tailored to your birth chart', 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800&q=80', '/astrology/horoscopes', 'sidebar'),
('Compatibility Analysis', 'Discover your relationship dynamics', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80', '/astrology/compatibility', 'content-bottom')
ON CONFLICT DO NOTHING;

-- Add to realtime publication
BEGIN;
    ALTER publication supabase_realtime ADD TABLE ads;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END;

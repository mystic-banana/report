-- Create ad banner system tables

-- Ad banners table
CREATE TABLE IF NOT EXISTS ad_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  ad_type VARCHAR(50) NOT NULL CHECK (ad_type IN ('image', 'svg', 'html', 'text')),
  content TEXT NOT NULL, -- Image URL, SVG code, HTML content, or text content
  cta_text VARCHAR(100),
  target_url VARCHAR(500),
  zones TEXT[] DEFAULT '{}', -- Array of zone names
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad analytics table for tracking views and clicks
CREATE TABLE IF NOT EXISTS ad_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_banner_id UUID REFERENCES ad_banners(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('view', 'click')),
  user_id UUID REFERENCES auth.users(id),
  zone VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad zones configuration table
CREATE TABLE IF NOT EXISTS ad_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  max_width INTEGER,
  max_height INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ad zones
INSERT INTO ad_zones (name, display_name, description, max_width, max_height) VALUES
('homepage-hero', 'Homepage Hero', 'Large banner on homepage hero section', 1200, 400),
('homepage-sidebar', 'Homepage Sidebar', 'Sidebar banner on homepage', 300, 250),
('magazine-header', 'Magazine Header', 'Header banner on magazine page', 728, 90),
('magazine-sidebar', 'Magazine Sidebar', 'Sidebar banner on magazine page', 300, 250),
('article-top', 'Article Top', 'Banner at top of article pages', 728, 90),
('article-bottom', 'Article Bottom', 'Banner at bottom of article pages', 728, 90),
('article-sidebar', 'Article Sidebar', 'Sidebar banner on article pages', 300, 250),
('podcast-header', 'Podcast Header', 'Header banner on podcast pages', 728, 90),
('podcast-sidebar', 'Podcast Sidebar', 'Sidebar banner on podcast pages', 300, 250),
('podcast-detail-top', 'Podcast Detail Top', 'Banner at top of podcast detail pages', 728, 90),
('mobile-banner', 'Mobile Banner', 'Mobile-optimized banner', 320, 100),
('dashboard-widget', 'Dashboard Widget', 'Small banner in dashboard', 300, 150)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_banners_active ON ad_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_banners_dates ON ad_banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_banners_zones ON ad_banners USING GIN(zones);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_banner_id ON ad_analytics(ad_banner_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_created_at ON ad_analytics(created_at);

-- Function to get active ads for a zone
CREATE OR REPLACE FUNCTION get_active_ads_for_zone(zone_name TEXT)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  ad_type VARCHAR(50),
  content TEXT,
  cta_text VARCHAR(100),
  target_url VARCHAR(500),
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ab.id,
    ab.title,
    ab.ad_type,
    ab.content,
    ab.cta_text,
    ab.target_url,
    ab.priority
  FROM ad_banners ab
  WHERE ab.is_active = true
    AND (ab.start_date IS NULL OR ab.start_date <= NOW())
    AND (ab.end_date IS NULL OR ab.end_date >= NOW())
    AND (zone_name = ANY(ab.zones) OR array_length(ab.zones, 1) IS NULL)
  ORDER BY ab.priority DESC, ab.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to track ad events
CREATE OR REPLACE FUNCTION track_ad_event(
  p_ad_banner_id UUID,
  p_event_type VARCHAR(20),
  p_user_id UUID DEFAULT NULL,
  p_zone VARCHAR(100) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ad_analytics (
    ad_banner_id,
    event_type,
    user_id,
    zone,
    user_agent,
    ip_address
  ) VALUES (
    p_ad_banner_id,
    p_event_type,
    p_user_id,
    p_zone,
    p_user_agent,
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Ad banners: Admins can manage, everyone can view active ads
CREATE POLICY "Admins can manage ad banners" ON ad_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Everyone can view active ad banners" ON ad_banners
  FOR SELECT USING (is_active = true);

-- Ad zones: Everyone can view, admins can manage
CREATE POLICY "Everyone can view ad zones" ON ad_zones
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage ad zones" ON ad_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Ad analytics: Admins can view all, users can view their own
CREATE POLICY "Admins can view all ad analytics" ON ad_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view their own ad analytics" ON ad_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert ad analytics" ON ad_analytics
  FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ad_banners;
ALTER PUBLICATION supabase_realtime ADD TABLE ad_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE ad_zones;

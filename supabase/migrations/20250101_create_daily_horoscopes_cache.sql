-- Create daily horoscopes cache table
CREATE TABLE IF NOT EXISTS daily_horoscopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zodiac_sign TEXT NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  love_score INTEGER DEFAULT 75,
  career_score INTEGER DEFAULT 75,
  health_score INTEGER DEFAULT 75,
  lucky_numbers INTEGER[] DEFAULT '{7,14,21}',
  lucky_colors TEXT[] DEFAULT '{"Purple","Gold"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(zodiac_sign, date)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_daily_horoscopes_sign_date ON daily_horoscopes(zodiac_sign, date);
CREATE INDEX IF NOT EXISTS idx_daily_horoscopes_expires ON daily_horoscopes(expires_at);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE daily_horoscopes;

-- Create function to clean expired horoscopes
CREATE OR REPLACE FUNCTION clean_expired_horoscopes()
RETURNS void AS $$
BEGIN
  DELETE FROM daily_horoscopes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create report templates table if not exists
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('western', 'vedic', 'chinese', 'hellenistic', 'transit', 'compatibility')),
  category TEXT NOT NULL DEFAULT 'personal',
  sections JSONB DEFAULT '[]',
  styles JSONB DEFAULT '{}',
  layout TEXT DEFAULT 'single-column',
  theme JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  preview TEXT,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template categories table
CREATE TABLE IF NOT EXISTS template_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO template_categories (id, name, description, icon) VALUES
  ('personal', 'Personal', 'Templates for personal use', 'user'),
  ('professional', 'Professional', 'Templates for professional astrologers', 'briefcase'),
  ('system', 'System', 'Built-in system templates', 'settings'),
  ('premium', 'Premium', 'Premium templates for subscribers', 'crown')
ON CONFLICT (id) DO NOTHING;

-- Create template themes table
CREATE TABLE IF NOT EXISTS template_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  fonts JSONB NOT NULL,
  spacing JSONB NOT NULL,
  border_radius TEXT DEFAULT '4px',
  shadows JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default themes
INSERT INTO template_themes (id, name, colors, fonts, spacing, shadows) VALUES
  ('classic', 'Classic', 
   '{"primary": "#2c3e50", "secondary": "#34495e", "accent": "#f39c12", "background": "#ffffff", "text": "#2c3e50", "muted": "#7f8c8d"}',
   '{"heading": "Georgia, serif", "body": "Arial, sans-serif", "accent": "Georgia, serif"}',
   '{"small": "8px", "medium": "16px", "large": "32px"}',
   '{"small": "0 1px 3px rgba(0,0,0,0.1)", "medium": "0 4px 6px rgba(0,0,0,0.1)", "large": "0 10px 25px rgba(0,0,0,0.1)"}'),
  ('modern', 'Modern',
   '{"primary": "#667eea", "secondary": "#764ba2", "accent": "#f093fb", "background": "#f8fafc", "text": "#1a202c", "muted": "#718096"}',
   '{"heading": "Inter, sans-serif", "body": "Inter, sans-serif", "accent": "Inter, sans-serif"}',
   '{"small": "12px", "medium": "24px", "large": "48px"}',
   '{"small": "0 1px 3px rgba(0,0,0,0.05)", "medium": "0 4px 12px rgba(0,0,0,0.1)", "large": "0 20px 40px rgba(0,0,0,0.1)"}'),
  ('dark', 'Dark',
   '{"primary": "#f59e0b", "secondary": "#d97706", "accent": "#fbbf24", "background": "#0f0f23", "text": "#e5e5e5", "muted": "#9ca3af"}',
   '{"heading": "Inter, sans-serif", "body": "Inter, sans-serif", "accent": "Inter, sans-serif"}',
   '{"small": "8px", "medium": "16px", "large": "32px"}',
   '{"small": "0 1px 3px rgba(0,0,0,0.3)", "medium": "0 4px 12px rgba(0,0,0,0.4)", "large": "0 20px 40px rgba(0,0,0,0.5)"}'),
  ('mystical', 'Mystical',
   '{"primary": "#8b5cf6", "secondary": "#7c3aed", "accent": "#a78bfa", "background": "#1e1b4b", "text": "#e0e7ff", "muted": "#a5b4fc"}',
   '{"heading": "Playfair Display, serif", "body": "Inter, sans-serif", "accent": "Playfair Display, serif"}',
   '{"small": "10px", "medium": "20px", "large": "40px"}',
   '{"small": "0 2px 4px rgba(139, 92, 246, 0.1)", "medium": "0 8px 16px rgba(139, 92, 246, 0.2)", "large": "0 24px 48px rgba(139, 92, 246, 0.3)"}')
ON CONFLICT (id) DO NOTHING;

-- Insert default templates
INSERT INTO report_templates (id, name, description, type, category, is_public, is_default, tags) VALUES
  ('default-western', 'Classic Western', 'Traditional Western astrology template', 'western', 'system', true, true, '{"western","classic"}'),
  ('default-vedic', 'Traditional Vedic', 'Classic Vedic astrology template', 'vedic', 'system', true, true, '{"vedic","traditional"}'),
  ('default-chinese', 'Four Pillars', 'Chinese astrology Four Pillars template', 'chinese', 'system', true, true, '{"chinese","four-pillars"}'),
  ('default-transit', 'Transit Analysis', 'Current planetary transits template', 'transit', 'system', true, true, '{"transit","predictive"}'),
  ('default-compatibility', 'Synastry Report', 'Relationship compatibility template', 'compatibility', 'system', true, true, '{"compatibility","synastry"}'),
  ('default-hellenistic', 'Hellenistic Chart', 'Traditional Hellenistic astrology template', 'hellenistic', 'system', true, true, '{"hellenistic","traditional"}')
ON CONFLICT (id) DO NOTHING;

-- Create template usage tracking
CREATE TABLE IF NOT EXISTS template_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  report_id UUID,
  customizations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template ratings
CREATE TABLE IF NOT EXISTS template_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Create template customizations
CREATE TABLE IF NOT EXISTS template_customizations (
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  customizations JSONB NOT NULL,
  name TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (template_id, user_id)
);

-- Create functions for template management
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE report_templates 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_template_rating(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE report_templates 
  SET average_rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM template_ratings 
    WHERE template_ratings.template_id = report_templates.id
  ),
  updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for template tables
ALTER PUBLICATION supabase_realtime ADD TABLE report_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE template_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE template_ratings;

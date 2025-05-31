-- Create astrology-related tables for birth charts, interpretations, and reports

-- Birth charts table
CREATE TABLE IF NOT EXISTS birth_charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  birth_date TIMESTAMP WITH TIME ZONE NOT NULL,
  birth_time TIME,
  birth_location JSONB NOT NULL, -- {city, country, lat, lng, timezone}
  chart_data JSONB NOT NULL, -- Calculated planetary positions
  chart_type VARCHAR(50) DEFAULT 'natal', -- natal, transit, composite, etc.
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Astrological interpretations table
CREATE TABLE IF NOT EXISTS astrological_interpretations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  birth_chart_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  interpretation_type VARCHAR(100) NOT NULL, -- personality, career, love, health, etc.
  content TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT true,
  astrology_system VARCHAR(50) DEFAULT 'western', -- western, vedic, chinese
  confidence_score INTEGER DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compatibility reports table
CREATE TABLE IF NOT EXISTS compatibility_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chart1_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  chart2_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL,
  detailed_analysis JSONB NOT NULL,
  report_content TEXT NOT NULL,
  astrology_system VARCHAR(50) DEFAULT 'western',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily horoscopes table
CREATE TABLE IF NOT EXISTS daily_horoscopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zodiac_sign VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  love_score INTEGER DEFAULT 50,
  career_score INTEGER DEFAULT 50,
  health_score INTEGER DEFAULT 50,
  lucky_numbers INTEGER[] DEFAULT '{}',
  lucky_colors VARCHAR[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(zodiac_sign, date)
);

-- Transit forecasts table
CREATE TABLE IF NOT EXISTS transit_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  birth_chart_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  forecast_period VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
  planetary_transits JSONB NOT NULL,
  forecast_content TEXT NOT NULL,
  significance_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Astrology reports table (for saved/exported reports)
CREATE TABLE IF NOT EXISTS astrology_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_chart_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL, -- full_natal, compatibility, transit, etc.
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  chart_image_url TEXT,
  pdf_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_birth_charts_user_id ON birth_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_birth_charts_created_at ON birth_charts(created_at);
CREATE INDEX IF NOT EXISTS idx_interpretations_chart_id ON astrological_interpretations(birth_chart_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_user_id ON compatibility_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_horoscopes_sign_date ON daily_horoscopes(zodiac_sign, date);
CREATE INDEX IF NOT EXISTS idx_transit_forecasts_chart_date ON transit_forecasts(birth_chart_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON astrology_reports(user_id);

-- Enable realtime for astrology tables
ALTER PUBLICATION supabase_realtime ADD TABLE birth_charts;
ALTER PUBLICATION supabase_realtime ADD TABLE astrological_interpretations;
ALTER PUBLICATION supabase_realtime ADD TABLE compatibility_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_horoscopes;
ALTER PUBLICATION supabase_realtime ADD TABLE transit_forecasts;
ALTER PUBLICATION supabase_realtime ADD TABLE astrology_reports;

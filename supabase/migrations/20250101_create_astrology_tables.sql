-- Create astrology-related tables for birth charts, interpretations, and reports

-- Birth charts table with enhanced constraints and validation
CREATE TABLE IF NOT EXISTS birth_charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
  birth_date TIMESTAMP WITH TIME ZONE NOT NULL CHECK (birth_date >= '1900-01-01' AND birth_date <= NOW()),
  birth_time TIME,
  birth_location JSONB NOT NULL CHECK (
    birth_location ? 'city' AND 
    birth_location ? 'country' AND 
    birth_location ? 'latitude' AND 
    birth_location ? 'longitude' AND
    (birth_location->>'latitude')::numeric BETWEEN -90 AND 90 AND
    (birth_location->>'longitude')::numeric BETWEEN -180 AND 180
  ),
  chart_data JSONB NOT NULL CHECK (chart_data ? 'planets' AND chart_data ? 'houses'),
  chart_type VARCHAR(50) DEFAULT 'natal' CHECK (chart_type IN ('natal', 'transit', 'composite', 'solar_return', 'lunar_return')),
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

-- Compatibility reports table with enhanced constraints
CREATE TABLE IF NOT EXISTS compatibility_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chart1_id UUID NOT NULL REFERENCES birth_charts(id) ON DELETE CASCADE,
  chart2_id UUID NOT NULL REFERENCES birth_charts(id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
  detailed_analysis JSONB NOT NULL,
  report_content TEXT NOT NULL CHECK (length(trim(report_content)) > 0),
  astrology_system VARCHAR(50) DEFAULT 'western' CHECK (astrology_system IN ('western', 'vedic', 'chinese')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_charts CHECK (chart1_id != chart2_id),
  CONSTRAINT unique_chart_pair UNIQUE (chart1_id, chart2_id)
);

-- Daily horoscopes table with enhanced validation
CREATE TABLE IF NOT EXISTS daily_horoscopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zodiac_sign VARCHAR(20) NOT NULL CHECK (zodiac_sign IN (
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  )),
  date DATE NOT NULL CHECK (date >= '2020-01-01' AND date <= (CURRENT_DATE + INTERVAL '1 year')),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  love_score INTEGER DEFAULT 50 CHECK (love_score BETWEEN 0 AND 100),
  career_score INTEGER DEFAULT 50 CHECK (career_score BETWEEN 0 AND 100),
  health_score INTEGER DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  lucky_numbers INTEGER[] DEFAULT '{}' CHECK (array_length(lucky_numbers, 1) <= 10),
  lucky_colors VARCHAR[] DEFAULT '{}' CHECK (array_length(lucky_colors, 1) <= 5),
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_sign_date UNIQUE(zodiac_sign, date)
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

-- Add comprehensive indexes for better performance
CREATE INDEX IF NOT EXISTS idx_birth_charts_user_id ON birth_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_birth_charts_created_at ON birth_charts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birth_charts_user_created ON birth_charts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birth_charts_chart_type ON birth_charts(chart_type);
CREATE INDEX IF NOT EXISTS idx_birth_charts_public ON birth_charts(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_interpretations_chart_id ON astrological_interpretations(birth_chart_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_type ON astrological_interpretations(interpretation_type);
CREATE INDEX IF NOT EXISTS idx_interpretations_system ON astrological_interpretations(astrology_system);
CREATE INDEX IF NOT EXISTS idx_interpretations_created ON astrological_interpretations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compatibility_user_id ON compatibility_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_charts ON compatibility_reports(chart1_id, chart2_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_created ON compatibility_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_score ON compatibility_reports(compatibility_score DESC);

CREATE INDEX IF NOT EXISTS idx_horoscopes_sign_date ON daily_horoscopes(zodiac_sign, date DESC);
CREATE INDEX IF NOT EXISTS idx_horoscopes_date ON daily_horoscopes(date DESC);
CREATE INDEX IF NOT EXISTS idx_horoscopes_created ON daily_horoscopes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transit_forecasts_chart_date ON transit_forecasts(birth_chart_id, forecast_date DESC);
CREATE INDEX IF NOT EXISTS idx_transit_forecasts_period ON transit_forecasts(forecast_period);
CREATE INDEX IF NOT EXISTS idx_transit_forecasts_significance ON transit_forecasts(significance_level);
CREATE INDEX IF NOT EXISTS idx_transit_forecasts_created ON transit_forecasts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON astrology_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_chart_id ON astrology_reports(birth_chart_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON astrology_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_premium ON astrology_reports(is_premium);
CREATE INDEX IF NOT EXISTS idx_reports_created ON astrology_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_created ON astrology_reports(user_id, created_at DESC);

-- Add partial indexes for frequently queried combinations
CREATE INDEX IF NOT EXISTS idx_reports_user_type_created ON astrology_reports(user_id, report_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_charts_user_type_created ON birth_charts(user_id, chart_type, created_at DESC);

-- Enable realtime for astrology tables
ALTER PUBLICATION supabase_realtime ADD TABLE birth_charts;
ALTER PUBLICATION supabase_realtime ADD TABLE astrological_interpretations;
ALTER PUBLICATION supabase_realtime ADD TABLE compatibility_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_horoscopes;
ALTER PUBLICATION supabase_realtime ADD TABLE transit_forecasts;
ALTER PUBLICATION supabase_realtime ADD TABLE astrology_reports;

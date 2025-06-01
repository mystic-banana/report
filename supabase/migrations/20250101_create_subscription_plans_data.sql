-- Insert default subscription plans
INSERT INTO subscription_plans (
  name,
  price,
  billing_period,
  description,
  astrology_features,
  is_popular,
  is_active
) VALUES 
(
  'Free Explorer',
  0,
  'forever',
  'Perfect for getting started with astrology',
  '{
    "birth_charts_limit": 5,
    "compatibility_reports_limit": 5,
    "transit_reports_limit": 1,
    "vedic_reports": false,
    "premium_interpretations": false,
    "pdf_downloads": false,
    "priority_support": false
  }'::jsonb,
  false,
  true
),
(
  'Cosmic Seeker',
  19,
  'monthly',
  'Unlock deeper cosmic insights',
  '{
    "birth_charts_limit": 25,
    "compatibility_reports_limit": 25,
    "transit_reports_limit": 10,
    "vedic_reports": true,
    "premium_interpretations": true,
    "pdf_downloads": true,
    "priority_support": true
  }'::jsonb,
  true,
  true
),
(
  'Astral Master',
  49,
  'monthly',
  'Complete astrological mastery',
  '{
    "birth_charts_limit": null,
    "compatibility_reports_limit": null,
    "transit_reports_limit": null,
    "vedic_reports": true,
    "premium_interpretations": true,
    "pdf_downloads": true,
    "priority_support": true
  }'::jsonb,
  false,
  true
);

-- Update existing astrology tables to support transit reports
ALTER TABLE astrology_reports 
ADD COLUMN IF NOT EXISTS forecast_date DATE,
ADD COLUMN IF NOT EXISTS forecast_period VARCHAR(50);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_astrology_reports_type_user 
ON astrology_reports(report_type, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active 
ON subscription_plans(is_active, price);

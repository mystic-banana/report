-- Create subscription plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('monthly', 'yearly')),
  features TEXT[] DEFAULT '{}',
  astrology_features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Enable realtime (tables may already be in publication)
-- alter publication supabase_realtime add table subscription_plans;
-- alter publication supabase_realtime add table user_subscriptions;

-- Insert default free plan if no plans exist
INSERT INTO subscription_plans (name, description, price, currency, interval, features, astrology_features, is_active, is_popular)
SELECT 
  'Free',
  'Perfect for exploring astrology basics',
  0,
  'USD',
  'monthly',
  ARRAY[
    'Basic birth chart generation',
    'Daily horoscopes for all signs',
    'Community access',
    'Basic compatibility analysis',
    'Monthly newsletter'
  ],
  '{
    "birth_charts_limit": 5,
    "compatibility_reports_limit": 5,
    "daily_horoscopes": true,
    "transit_forecasts": false,
    "premium_reports": false,
    "ai_interpretations": false,
    "chart_sharing": false,
    "priority_support": false,
    "advanced_aspects": false,
    "yearly_forecasts": false
  }'::jsonb,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Free');

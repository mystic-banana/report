-- Check if site_settings table exists, create if not
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update AdSense configuration
INSERT INTO public.site_settings (key, value)
VALUES (
  'adsense_config', 
  jsonb_build_object(
    'enabled', true,
    'publisher_id', 'pub-1234567890123456',
    'ad_client', 'ca-pub-1234567890123456',
    'article_ad_slot', '1234567890',
    'sidebar_ad_slot', '0987654321',
    'podcast_ad_slot', '1122334455',
    'show_premium_users', false,
    'auto_ads_enabled', false
  )
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, 
    updated_at = NOW();

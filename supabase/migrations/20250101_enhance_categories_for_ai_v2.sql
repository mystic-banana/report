-- Enhanced Categories Table for Modern AI Article Generation
-- Add new fields for category-specific layouts and improved AI generation

ALTER TABLE categories ADD COLUMN IF NOT EXISTS content_structure JSONB DEFAULT '{
  "format": "article",
  "sections": ["title", "content"],
  "layout_type": "standard",
  "max_word_count": 800,
  "min_word_count": 300
}'::jsonb;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS output_format TEXT DEFAULT 'html';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_generation_strategy TEXT DEFAULT 'dalle';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_style TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_prompt_template TEXT;

-- SEO and Layout Configuration
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{
  "title_max_length": 60,
  "meta_description_max_length": 155,
  "focus_keywords": [],
  "content_tone": "informative"
}'::jsonb;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{
  "hero_style": "standard",
  "card_layout": "default",
  "color_scheme": "default",
  "typography": "serif"
}'::jsonb;

-- Update AI model to use only GPT-4.1 Mini
UPDATE categories SET ai_model = 'gpt-4.1-mini-2025-04-14' WHERE ai_model IS NULL OR ai_model = 'gpt-4.1-nano' OR ai_model = 'gpt-4-turbo-preview';

-- Add article generation metadata
ALTER TABLE articles ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_quality_score INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;

-- Create function to increment read count
CREATE OR REPLACE FUNCTION increment_article_read_count(article_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET read_count = COALESCE(read_count, 0) + 1 
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing categories with enhanced settings
UPDATE categories SET 
  content_structure = CASE 
    WHEN name = 'Sacred Kitchen' THEN '{
      "format": "recipe",
      "layout_type": "recipe_card",
      "sections": ["title", "introduction", "ingredients", "instructions", "tips"],
      "max_word_count": 600,
      "min_word_count": 300,
      "recipe_specific": {
        "include_prep_time": true,
        "include_cook_time": true,
        "include_servings": true,
        "include_nutrition": false
      }
    }'::jsonb
    WHEN name ILIKE '%meditation%' OR name ILIKE '%mindfulness%' THEN '{
      "format": "guide",
      "layout_type": "step_by_step",
      "sections": ["title", "introduction", "benefits", "practice_steps", "conclusion"],
      "max_word_count": 700,
      "min_word_count": 400
    }'::jsonb
    WHEN name ILIKE '%astrology%' OR name ILIKE '%tarot%' THEN '{
      "format": "insight",
      "layout_type": "mystical",
      "sections": ["title", "overview", "key_insights", "practical_advice"],
      "max_word_count": 500,
      "min_word_count": 250
    }'::jsonb
    ELSE '{
      "format": "article",
      "layout_type": "standard",
      "sections": ["title", "introduction", "main_content", "conclusion"],
      "max_word_count": 600,
      "min_word_count": 300
    }'::jsonb
  END,
  seo_settings = '{
    "title_max_length": 55,
    "meta_description_max_length": 150,
    "focus_keywords": [],
    "content_tone": "engaging",
    "target_audience": "spiritual_seekers"
  }'::jsonb,
  image_generation_strategy = 'dalle',
  image_style = CASE 
    WHEN name = 'Sacred Kitchen' THEN 'professional food photography, top-down view, natural lighting'
    WHEN name ILIKE '%meditation%' THEN 'serene, peaceful, minimalist, soft lighting'
    WHEN name ILIKE '%astrology%' THEN 'mystical, cosmic, celestial, deep purples and golds'
    ELSE 'modern, clean, inspiring, warm tones'
  END
WHERE content_structure IS NULL OR content_structure = '{}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category_published ON articles(category_id, published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_read_count ON articles(read_count DESC);
CREATE INDEX IF NOT EXISTS idx_articles_generated_by_ai ON articles(generated_by_ai, created_at);

-- Enable realtime for articles
ALTER PUBLICATION supabase_realtime ADD TABLE articles;

-- SQL commands to alter the 'categories' table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS ai_prompt TEXT,
ADD COLUMN IF NOT EXISTS generation_frequency TEXT,
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gpt-4.1-nano';

-- SQL commands to alter the 'articles' table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN DEFAULT FALSE;

-- Optional: Add some initial categories if they don't exist
INSERT INTO public.categories (name, slug, description, ai_model) VALUES
('Daily Horoscopes', 'daily-horoscopes', 'Your daily astrological insights.', 'gpt-4.1-nano'),
('Tech Innovation Today', 'tech-innovation-today', 'Latest news and discussions on technology.', 'gpt-4.1-nano'),
('Organic Gourmet Recipes', 'organic-gourmet-recipes', 'Delicious and healthy organic recipes.', 'gpt-4.1-nano'),
('World Travel Insights', 'world-travel-insights', 'Tips, guides, and stories from around the globe.', 'gpt-4.1-nano'),
('Mystic Musings', 'mystic-musings', 'Explorations into esoteric and mystical topics.', 'gpt-4.1-nano')
ON CONFLICT (slug) DO NOTHING;

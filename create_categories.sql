CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    ai_prompt TEXT,
    ai_model TEXT DEFAULT 'gpt-4.1-nano',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT 'Categories table created successfully.' AS status;

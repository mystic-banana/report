-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some default categories
INSERT INTO categories (id, name, description) 
VALUES 
  ('c1e25edf-ec02-4b16-88a2-ad23c2986eec', 'Technology', 'Technology podcasts featuring the latest in tech news'),
  ('d5f38c47-74b1-48b1-a82f-3d5f1162e11a', 'Business', 'Business and entrepreneurship podcasts'),
  ('9a6b23d5-4c81-4fc0-adbc-54112c7d68c6', 'Science', 'Science, research, and discovery podcasts'),
  ('f4a9e1d3-bd56-4174-b5c6-32e4b4d9c040', 'Entertainment', 'Entertainment and pop culture podcasts')
ON CONFLICT (name) DO NOTHING;

-- Update existing podcasts to use category_id if they only have category text
UPDATE podcasts
SET 
  category_id = (SELECT id FROM categories WHERE categories.name = podcasts.category),
  status = COALESCE(status, 'approved')
WHERE 
  category_id IS NULL AND category IS NOT NULL;

-- Insert some test podcasts
INSERT INTO podcasts (name, category_id, feed_url, description, image_url, author, status, created_at, updated_at)
VALUES
  ('Tech Talk Daily', 'c1e25edf-ec02-4b16-88a2-ad23c2986eec', 
   'https://feeds.example.com/techtalkdaily', 
   'Daily tech news and industry analysis', 
   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 
   'Sarah Johnson', 'approved', NOW(), NOW()),
  
  ('Future Science', '9a6b23d5-4c81-4fc0-adbc-54112c7d68c6', 
   'https://feeds.example.com/futurescience', 
   'Exploring the frontiers of scientific research', 
   'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 
   'Dr. Robert Chen', 'approved', NOW(), NOW()),
  
  ('Startup Stories', 'd5f38c47-74b1-48b1-a82f-3d5f1162e11a', 
   'https://feeds.example.com/startupstories', 
   'Interviews with successful startup founders', 
   'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 
   'Mike Williams', 'approved', NOW(), NOW()),
  
  ('Pop Culture Weekly', 'f4a9e1d3-bd56-4174-b5c6-32e4b4d9c040', 
   'https://feeds.example.com/popcultureweekly', 
   'Weekly discussions on entertainment and pop culture', 
   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 
   'Jessica Taylor', 'approved', NOW(), NOW())
ON CONFLICT DO NOTHING;

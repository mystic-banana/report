-- Insert test categories first (if they don't exist)
INSERT INTO categories (id, name, description)
VALUES 
  ('c1e25edf-ec02-4b16-88a2-ad23c2986eec', 'Technology', 'Technology podcasts featuring the latest in tech news, gadget reviews, and developer insights'),
  ('d5f38c47-74b1-48b1-a82f-3d5f1162e11a', 'Business', 'Business and entrepreneurship podcasts'),
  ('9a6b23d5-4c81-4fc0-adbc-54112c7d68c6', 'Science', 'Science, research, and discovery podcasts'),
  ('f4a9e1d3-bd56-4174-b5c6-32e4b4d9c040', 'Entertainment', 'Entertainment, pop culture, and celebrity interviews')
ON CONFLICT (id) DO NOTHING;

-- Insert test podcasts with approved status
INSERT INTO podcasts (id, name, category_id, feed_url, description, image_url, author, status, created_at, updated_at)
VALUES
  ('8f7e6d5c-4b3a-2a1c-0e9f-8d7e6f5a4b3a', 'Tech Talk Daily', 'c1e25edf-ec02-4b16-88a2-ad23c2986eec', 'https://feeds.example.com/techtalkdaily', 'Daily tech news and industry analysis', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 'Sarah Johnson', 'approved', NOW(), NOW()),
  
  ('7d6c5b4a-3f2e-1d0c-9e8d-7c6b5a4d3e2a', 'Future Science', '9a6b23d5-4c81-4fc0-adbc-54112c7d68c6', 'https://feeds.example.com/futurescience', 'Exploring the frontiers of scientific research', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 'Dr. Robert Chen', 'approved', NOW(), NOW()),
  
  ('6b5a4d3c-2e1d-0c9b-8a7f-6e5d4c3b2a1d', 'Startup Stories', 'd5f38c47-74b1-48b1-a82f-3d5f1162e11a', 'https://feeds.example.com/startupstories', 'Interviews with successful startup founders', 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 'Mike Williams', 'approved', NOW(), NOW()),
  
  ('5a4d3c2b-1e0d-9c8b-7a6f-5e4d3c2b1a0e', 'Pop Culture Weekly', 'f4a9e1d3-bd56-4174-b5c6-32e4b4d9c040', 'https://feeds.example.com/popcultureweekly', 'Weekly discussions on entertainment and pop culture', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 'Jessica Taylor', 'approved', NOW(), NOW()),
  
  ('4d3c2b1a-0e9d-8c7b-6a5f-4e3d2c1b0a9f', 'Code Chronicles', 'c1e25edf-ec02-4b16-88a2-ad23c2986eec', 'https://feeds.example.com/codechronicles', 'Developer stories and coding best practices', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 'David Kumar', 'approved', NOW(), NOW()),
  
  ('3c2b1a0e-9d8c-7b6a-5f4e-3d2c1b0a9f8e', 'Health Matters', '9a6b23d5-4c81-4fc0-adbc-54112c7d68c6', 'https://feeds.example.com/healthmatters', 'The latest in health science and wellness', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', 'Dr. Emily Rivera', 'approved', NOW(), NOW())
  
ON CONFLICT (id) DO NOTHING;

-- Insert some test episodes
INSERT INTO episodes (id, podcast_id, title, description, audio_url, image_url, pub_date, duration)
VALUES
  ('e1d0c9b8-a7f6-5e4d-3c2b-1a0e9d8c7b6a', '8f7e6d5c-4b3a-2a1c-0e9f-8d7e6f5a4b3a', 'The Future of AI', 'Discussing the latest developments in artificial intelligence', 'https://example.com/episodes/ai-future.mp3', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', NOW() - INTERVAL '2 days', '45:30'),
  
  ('e2d1c0b9-a8f7-6e5d-4c3b-2a1e0d9c8b7a', '8f7e6d5c-4b3a-2a1c-0e9f-8d7e6f5a4b3a', 'Quantum Computing Explained', 'An in-depth look at quantum computing technology', 'https://example.com/episodes/quantum-computing.mp3', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', NOW() - INTERVAL '9 days', '52:15'),
  
  ('e3d2c1b0-a9f8-7e6d-5c4b-3a2e1d0c9b8a', '7d6c5b4a-3f2e-1d0c-9e8d-7c6b5a4d3e2a', 'Mars Exploration Update', 'The latest findings from Mars rover missions', 'https://example.com/episodes/mars-update.mp3', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', NOW() - INTERVAL '3 days', '38:45'),
  
  ('e4d3c2b1-a0e9-8d7c-6b5a-4e3d2c1b0a9f', '6b5a4d3c-2e1d-0c9b-8a7f-6e5d4c3b2a1d', 'From Idea to IPO', 'The journey of a successful startup', 'https://example.com/episodes/idea-to-ipo.mp3', 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80', NOW() - INTERVAL '5 days', '62:10')
  
ON CONFLICT (id) DO NOTHING;

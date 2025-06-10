-- Create report templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  sections JSONB DEFAULT '[]'::jsonb,
  styles JSONB DEFAULT '{}'::jsonb,
  layout TEXT DEFAULT 'single-column',
  theme JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),
  tags TEXT[] DEFAULT '{}'::text[],
  preview TEXT
);

-- Create template categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Create template themes table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  fonts JSONB NOT NULL,
  spacing JSONB,
  border_radius TEXT,
  shadows JSONB
);

-- Create template ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_ratings (
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (template_id, user_id)
);

-- Create template usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID,
  customizations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template customizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_customizations (
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customizations JSONB NOT NULL,
  name TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (template_id, user_id)
);

-- Create function to update template rating
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE report_templates
  SET average_rating = (
    SELECT AVG(rating)
    FROM template_ratings
    WHERE template_id = NEW.template_id
  )
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating template rating
DROP TRIGGER IF EXISTS update_template_rating_trigger ON template_ratings;
CREATE TRIGGER update_template_rating_trigger
AFTER INSERT OR UPDATE ON template_ratings
FOR EACH ROW
EXECUTE FUNCTION update_template_rating();

-- Create function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE report_templates
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for incrementing template usage count
DROP TRIGGER IF EXISTS increment_template_usage_trigger ON template_usage;
CREATE TRIGGER increment_template_usage_trigger
AFTER INSERT ON template_usage
FOR EACH ROW
EXECUTE FUNCTION increment_template_usage();

-- Insert default template categories
INSERT INTO template_categories (id, name, description, icon)
VALUES 
  ('personal', 'Personal', 'Templates for personal use', 'user'),
  ('professional', 'Professional', 'Templates for professional astrologers', 'briefcase'),
  ('system', 'System', 'Built-in system templates', 'settings'),
  ('premium', 'Premium', 'Premium templates for subscribers', 'crown')
ON CONFLICT (id) DO NOTHING;

-- Insert default template themes
INSERT INTO template_themes (id, name, colors, fonts, spacing, border_radius, shadows)
VALUES 
  ('classic', 'Classic', 
   '{"primary":"#2c3e50","secondary":"#34495e","accent":"#f39c12","background":"#ffffff","text":"#2c3e50","muted":"#7f8c8d"}', 
   '{"heading":"Georgia, serif","body":"Arial, sans-serif","accent":"Georgia, serif"}',
   '{"small":"8px","medium":"16px","large":"32px"}',
   '4px',
   '{"small":"0 1px 3px rgba(0,0,0,0.1)","medium":"0 4px 6px rgba(0,0,0,0.1)","large":"0 10px 25px rgba(0,0,0,0.1)"}')
ON CONFLICT (id) DO NOTHING;

-- Enable row level security
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON report_templates;
CREATE POLICY "Public templates are viewable by everyone"
  ON report_templates FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own templates" ON report_templates;
CREATE POLICY "Users can view their own templates"
  ON report_templates FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create their own templates" ON report_templates;
CREATE POLICY "Users can create their own templates"
  ON report_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own templates" ON report_templates;
CREATE POLICY "Users can update their own templates"
  ON report_templates FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own templates" ON report_templates;
CREATE POLICY "Users can delete their own templates"
  ON report_templates FOR DELETE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Template categories are viewable by everyone" ON template_categories;
CREATE POLICY "Template categories are viewable by everyone"
  ON template_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Template themes are viewable by everyone" ON template_themes;
CREATE POLICY "Template themes are viewable by everyone"
  ON template_themes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view their own ratings" ON template_ratings;
CREATE POLICY "Users can view their own ratings"
  ON template_ratings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own ratings" ON template_ratings;
CREATE POLICY "Users can create their own ratings"
  ON template_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own ratings" ON template_ratings;
CREATE POLICY "Users can update their own ratings"
  ON template_ratings FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own usage" ON template_usage;
CREATE POLICY "Users can view their own usage"
  ON template_usage FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own usage" ON template_usage;
CREATE POLICY "Users can create their own usage"
  ON template_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own customizations" ON template_customizations;
CREATE POLICY "Users can view their own customizations"
  ON template_customizations FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own customizations" ON template_customizations;
CREATE POLICY "Users can create their own customizations"
  ON template_customizations FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own customizations" ON template_customizations;
CREATE POLICY "Users can update their own customizations"
  ON template_customizations FOR UPDATE
  USING (user_id = auth.uid());

-- Enable realtime for these tables
alter publication supabase_realtime add table report_templates;
alter publication supabase_realtime add table template_categories;
alter publication supabase_realtime add table template_themes;

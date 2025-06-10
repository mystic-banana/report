-- Fix the birth_charts table to ensure latitude and longitude are available as direct columns
-- while maintaining compatibility with the existing birth_location JSONB field

-- First check if these columns already exist to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birth_charts' AND column_name = 'latitude'
  ) THEN
    -- Add latitude and longitude as direct columns
    ALTER TABLE birth_charts ADD COLUMN latitude NUMERIC;
    ALTER TABLE birth_charts ADD COLUMN longitude NUMERIC;
    ALTER TABLE birth_charts ADD COLUMN city TEXT;
    ALTER TABLE birth_charts ADD COLUMN country TEXT;

    -- Update the new columns with data from the birth_location JSONB field
    UPDATE birth_charts 
    SET 
      latitude = (birth_location->>'latitude')::numeric,
      longitude = (birth_location->>'longitude')::numeric,
      city = birth_location->>'city',
      country = birth_location->>'country';
  END IF;
END $$;

-- Create proper foreign key relationship between report_templates and template_categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'report_templates' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_report_templates_category'
  ) THEN
    -- First ensure the column type matches - template_categories.id is TEXT
    ALTER TABLE report_templates ALTER COLUMN category TYPE TEXT;
    
    -- Now add the foreign key constraint
    ALTER TABLE report_templates 
    ADD CONSTRAINT fk_report_templates_category 
    FOREIGN KEY (category) REFERENCES template_categories(id);
  END IF;
END $$;

-- Create some default template categories if they don't exist
INSERT INTO template_categories (id, name, description, icon)
VALUES 
  ('natal', 'Natal Charts', 'In-depth analysis of birth charts', 'planet'),
  ('compatibility', 'Compatibility', 'Relationship compatibility analysis', 'heart'),
  ('transit', 'Transit Reports', 'Analysis of planetary transits', 'calendar'),
  ('horoscope', 'Horoscopes', 'Daily, weekly, and monthly predictions', 'stars')
ON CONFLICT (id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_birth_charts_latitude_longitude ON birth_charts (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_birth_chart_id ON astrology_reports (birth_chart_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates (category);

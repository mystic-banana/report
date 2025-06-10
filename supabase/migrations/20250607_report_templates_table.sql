-- Create table for storing report templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  template_content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  thumbnail_url TEXT
);

-- Add RLS policies
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all templates
CREATE POLICY "Admins can manage all templates" ON public.report_templates
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- All authenticated users can view templates
CREATE POLICY "Authenticated users can view templates" ON public.report_templates
  FOR SELECT
  TO authenticated
  USING (
    -- Non-premium users can only access non-premium templates
    (NOT is_premium) OR
    -- Users with premium subscription can access all templates
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND subscription_tier = 'premium'
    )
  );

-- Function to ensure only one default template per report type
CREATE OR REPLACE FUNCTION check_default_template()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    -- If this is being set as default, unset any other defaults for the same report type
    UPDATE public.report_templates
    SET is_default = FALSE
    WHERE report_type = NEW.report_type
    AND id != NEW.id
    AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure default template constraint
CREATE TRIGGER enforce_single_default_template
  BEFORE INSERT OR UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION check_default_template();

-- Add updated_at trigger
CREATE TRIGGER update_template_timestamp
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default templates
INSERT INTO public.report_templates (name, description, report_type, template_content, is_default, is_premium)
VALUES 
('Standard Western', 'Default template for Western astrology charts', 'western', 
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{REPORT_TITLE}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { text-align: center; margin-bottom: 2rem; }
    .birth-info { margin-bottom: 1.5rem; padding: 1rem; background: #f9f9f9; border-radius: 4px; }
    .chart-container { text-align: center; margin: 2rem 0; }
    .section-title { color: #6b46c1; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{REPORT_TITLE}}</h1>
    <p>{{REPORT_TYPE}} Report</p>
  </div>
  
  <div class="birth-info">
    <p><strong>Name:</strong> {{PERSON_NAME}}</p>
    <p><strong>Birth Date:</strong> {{BIRTH_DATE}}</p>
    <p><strong>Birth Time:</strong> {{BIRTH_TIME}}</p>
    <p><strong>Birth Location:</strong> {{BIRTH_LOCATION}}</p>
  </div>
  
  <div class="chart-container">
    <h2>Natal Chart</h2>
    {{WESTERN_CHART}}
  </div>
  
  <div class="report-content">
    {{REPORT_CONTENT}}
  </div>
  
  <footer>
    <p>Generated on {{GENERATION_DATE}} by Mystic Banana Astrology</p>
  </footer>
</body>
</html>', 
TRUE, FALSE),

('Premium Western', 'Enhanced template for premium users with Western astrology charts', 'western', 
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{REPORT_TITLE}}</title>
  <style>
    body { font-family: "Helvetica Neue", Helvetica, sans-serif; line-height: 1.8; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 3rem; padding: 2rem; background: linear-gradient(135deg, #7e57c2 0%, #4a148c 100%); color: white; border-radius: 8px; }
    .birth-info { margin-bottom: 2rem; padding: 1.5rem; background: #f5f5f7; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .chart-container { text-align: center; margin: 2.5rem 0; background: #f9f7ff; padding: 2rem; border-radius: 8px; }
    .section-title { color: #7e57c2; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.8rem; margin-top: 2rem; }
    .footer { text-align: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e0e0e0; font-size: 0.9rem; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{REPORT_TITLE}}</h1>
    <p>Premium {{REPORT_TYPE}} Analysis</p>
  </div>
  
  <div class="birth-info">
    <div>
      <p><strong>Name</strong><br>{{PERSON_NAME}}</p>
      <p><strong>Birth Date</strong><br>{{BIRTH_DATE}}</p>
    </div>
    <div>
      <p><strong>Birth Time</strong><br>{{BIRTH_TIME}}</p>
      <p><strong>Birth Location</strong><br>{{BIRTH_LOCATION}}</p>
    </div>
  </div>
  
  <div class="chart-container">
    <h2>Professional Natal Chart</h2>
    {{WESTERN_CHART}}
  </div>
  
  <div class="report-content">
    {{REPORT_CONTENT}}
  </div>
  
  <div class="footer">
    <p>Generated on {{GENERATION_DATE}} by Mystic Banana Astrology</p>
    <p>Premium Analysis - All Rights Reserved © {{CURRENT_YEAR}}</p>
  </div>
</body>
</html>', 
FALSE, TRUE),

('Standard Vedic', 'Default template for Vedic astrology charts', 'vedic', 
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{REPORT_TITLE}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { text-align: center; margin-bottom: 2rem; }
    .birth-info { margin-bottom: 1.5rem; padding: 1rem; background: #f9f9f9; border-radius: 4px; }
    .chart-container { text-align: center; margin: 2rem 0; }
    .section-title { color: #d97706; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{REPORT_TITLE}}</h1>
    <p>{{REPORT_TYPE}} Report</p>
  </div>
  
  <div class="birth-info">
    <p><strong>Name:</strong> {{PERSON_NAME}}</p>
    <p><strong>Birth Date:</strong> {{BIRTH_DATE}}</p>
    <p><strong>Birth Time:</strong> {{BIRTH_TIME}}</p>
    <p><strong>Birth Location:</strong> {{BIRTH_LOCATION}}</p>
  </div>
  
  <div class="chart-container">
    <h2>Vedic Birth Chart</h2>
    {{VEDIC_CHART}}
  </div>
  
  <div class="chart-container">
    <h2>Navamsa Chart</h2>
    {{NAVAMSA_CHART}}
  </div>
  
  <div class="report-content">
    {{REPORT_CONTENT}}
  </div>
  
  <footer>
    <p>Generated on {{GENERATION_DATE}} by Mystic Banana Astrology</p>
  </footer>
</body>
</html>', 
TRUE, FALSE);

-- Create index for performance
CREATE INDEX IF NOT EXISTS report_templates_report_type_idx ON public.report_templates(report_type);

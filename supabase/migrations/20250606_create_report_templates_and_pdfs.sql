-- Create a table for report templates
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  
  -- Add constraints
  CONSTRAINT report_templates_name_unique UNIQUE (name, report_type)
);

-- Add RLS policies for report templates
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read and write templates"
  ON report_templates
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Everyone can read templates"
  ON report_templates
  FOR SELECT
  USING (true);

-- Create a table to store PDF report references
CREATE TABLE IF NOT EXISTS report_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES astrology_reports(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  template_id UUID REFERENCES report_templates(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  
  -- Add index for faster lookups
  CONSTRAINT report_pdfs_report_id_idx UNIQUE (report_id, template_id)
);

-- Add RLS policies for report PDFs
ALTER TABLE report_pdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own report PDFs"
  ON report_pdfs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM astrology_reports
      WHERE astrology_reports.id = report_pdfs.report_id
      AND astrology_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read and write report PDFs"
  ON report_pdfs
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create a function to update template timestamps
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to update timestamps on template updates
CREATE TRIGGER update_report_template_timestamp
BEFORE UPDATE ON report_templates
FOR EACH ROW
EXECUTE FUNCTION update_template_timestamp();

-- Create bucket for PDF storage if it doesn't exist
-- This requires admin privileges
DO $$
BEGIN
  -- Check if the bucket already exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'report-pdfs'
  ) THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('report-pdfs', 'report-pdfs', false);
    
    -- Set bucket RLS policies
    CREATE POLICY "Users can read their own report PDFs"
      ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'report-pdfs' AND
        EXISTS (
          SELECT 1 FROM report_pdfs
          JOIN astrology_reports ON report_pdfs.report_id = astrology_reports.id
          WHERE storage.objects.name = report_pdfs.file_path
          AND astrology_reports.user_id = auth.uid()
        )
      );
      
    CREATE POLICY "Service role can upload PDFs"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'report-pdfs');
      
    CREATE POLICY "Admins can manage all PDFs"
      ON storage.objects
      USING (
        bucket_id = 'report-pdfs' AND
        auth.jwt() ->> 'role' = 'admin'
      )
      WITH CHECK (
        bucket_id = 'report-pdfs' AND
        auth.jwt() ->> 'role' = 'admin'
      );
  END IF;
END $$;

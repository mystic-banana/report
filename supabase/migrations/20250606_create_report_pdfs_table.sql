-- Create table for storing PDF report references
CREATE TABLE IF NOT EXISTS public.report_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.astrology_reports(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add storage policy for report-pdfs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-pdfs', 'report-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the report_pdfs table
ALTER TABLE public.report_pdfs ENABLE ROW LEVEL SECURITY;

-- Only allow users to access their own report PDFs
CREATE POLICY "Users can view their own report PDFs" ON public.report_pdfs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.astrology_reports ar
      WHERE ar.id = report_pdfs.report_id
      AND ar.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_report_pdfs_updated_at
  BEFORE UPDATE ON report_pdfs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index on report_id for faster lookups
CREATE INDEX IF NOT EXISTS report_pdfs_report_id_idx ON public.report_pdfs(report_id);

-- Storage policy for report-pdfs bucket
-- Allow users to read files related to their reports
CREATE POLICY "Users can view their own report PDFs" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'report-pdfs' AND
    EXISTS (
      SELECT 1 FROM public.report_pdfs rp
      JOIN public.astrology_reports ar ON rp.report_id = ar.id
      WHERE rp.file_path = storage.objects.name
      AND ar.user_id = auth.uid()
    )
  );

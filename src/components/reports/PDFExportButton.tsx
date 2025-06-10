import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { generateAndDownloadPdf, checkExistingPdf, PDFGenerationOptions } from '../../utils/serverPdfExport';
import toast from 'react-hot-toast';

interface PDFExportButtonProps {
  reportId: string;
  reportTitle?: string;
  reportType?: string;
  className?: string;
  variant?: 'outline' | 'secondary' | 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  templateId?: string;
  options?: PDFGenerationOptions;
}

export default function PDFExportButton({
  reportId,
  reportTitle = 'Astrological Report',
  reportType = 'Report',
  className = '',
  variant = 'outline',
  size = 'md',
  templateId,
  options
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [existingPdf, setExistingPdf] = useState<{ url: string; path: string } | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  useEffect(() => {
    // Check if a PDF already exists for this report
    const checkForExistingPdf = async () => {
      setIsCheckingExisting(true);
      try {
        const result = await checkExistingPdf(reportId);
        setExistingPdf(result);
      } catch (error) {
        console.error('Error checking for existing PDF:', error);
      } finally {
        setIsCheckingExisting(false);
      }
    };

    if (reportId) {
      checkForExistingPdf();
    }
  }, [reportId]);

  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      
      // If we have an existing PDF, download it directly
      if (existingPdf?.url) {
        const link = document.createElement('a');
        link.href = existingPdf.url;
        link.download = `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Downloaded existing PDF report');
      } else {
        // Generate a new PDF
        const filename = `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        await generateAndDownloadPdf(reportId, filename, templateId, options);
        
        // Refresh the existing PDF info
        const result = await checkExistingPdf(reportId);
        setExistingPdf(result);
      }
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={handleExport}
          disabled={isExporting || isCheckingExisting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : existingPdf ? (
            <FileText className="h-4 w-4 mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {(existingPdf ? 'Download PDF' : 'Export PDF')}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {existingPdf 
          ? 'Download previously generated PDF report' 
          : `Generate and download ${reportType} as PDF`}
      </TooltipContent>
    </Tooltip>
  );
}

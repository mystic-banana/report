import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '../ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import Button from '../ui/Button';
import { FileDown, Loader2, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { AstrologyReport } from '../../store/astrologyStore';
import { generateAndDownloadPdf, getAvailableTemplates } from '../../utils/serverPdfExport';
import { ReportTemplate } from '../../types/templates';
import { trackTemplateUsage } from '../../utils/templateAnalytics';
import { useUser } from '../../hooks/useUser';

interface ExportPdfDialogProps {
  report: AstrologyReport;
  trigger?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const ExportPdfDialog: React.FC<ExportPdfDialogProps> = ({ 
  report, 
  trigger, 
  className = '',
  onSuccess,
  onError
}) => {
  // Get current user information
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, report.report_type]);
  
  // Load preview when template changes
  useEffect(() => {
    if (selectedTemplateId && showPreview) {
      loadTemplatePreview();
    }
  }, [selectedTemplateId, showPreview]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      // Get templates for this report type
      const availableTemplates = await getAvailableTemplates(report.report_type);
      setTemplates(availableTemplates);
      
      // Try loading user's preferred template first
      const userPreference = localStorage.getItem(`preferred_template_${report.report_type}`);
      const preferredTemplate = userPreference && availableTemplates.find(t => t.id === userPreference);
      
      // If preferred template exists and user has access to it, select it
      if (preferredTemplate) {
        console.log('Using user preferred template:', preferredTemplate.name);
        setSelectedTemplateId(preferredTemplate.id);
      } else {
        // Otherwise, select default template if available
        const defaultTemplate = availableTemplates.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else {
          setSelectedTemplateId(''); // Use system default
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };
  
  // Load template preview
  const loadTemplatePreview = async () => {
    if (!selectedTemplateId) return;
    
    setIsLoadingPreview(true);
    try {
      // Get the HTML content for the selected template
      const { data, error } = await fetch('/api/templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          reportId: report.id,
        }),
      }).then(res => res.json());
      
      if (error) {
        throw new Error(error);
      }
      
      setPreviewHtml(data.previewHtml);
    } catch (error) {
      console.error('Error loading template preview:', error);
      toast.error('Failed to load template preview');
      setPreviewHtml('');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      await generateAndDownloadPdf(
        report.id,
        filename,
        selectedTemplateId || undefined
      );
      
      // Save this as the user's preferred template for this report type
      if (selectedTemplateId) {
        localStorage.setItem(`preferred_template_${report.report_type}`, selectedTemplateId);
        
        // Track template usage for analytics if user is logged in
        if (user?.id) {
          trackTemplateUsage(selectedTemplateId, user.id, report.report_type)
            .catch(err => console.error('Failed to track template usage:', err));
        }
      }
      
      setIsOpen(false);
      onSuccess?.();
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
      onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const togglePreview = () => {
    if (!showPreview) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };
  
  // Get the current template
  const currentTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Download}
            className={className}
          />
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export PDF Report</DialogTitle>
          <DialogDescription>
            Generate a PDF version of "{report.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Template</div>
            {isLoadingTemplates ? (
              <div className="flex items-center space-x-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span className="text-sm text-gray-400">Loading templates...</span>
              </div>
            ) : (
              <Select 
                value={selectedTemplateId} 
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default system template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default system template</SelectItem>
                  
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center">
                        <span>
                          {template.name}
                          {template.is_default && (
                            <span className="ml-1 text-amber-500">(Default)</span>
                          )}
                        </span>
                        {template.is_premium && (
                          <span className="ml-1 text-xs uppercase bg-magazine-accent text-white px-1 py-0.5 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {currentTemplate?.is_premium && (
              <p className="text-xs text-amber-500 mt-1">
                Using premium template - premium watermark will be removed for paying customers
              </p>
            )}
            
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
            
            {/* Template Preview Section */}
            {showPreview && (
              <div className="mt-3 border rounded-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 text-xs font-medium">
                  Template Preview
                </div>
                
                {isLoadingPreview ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                    <span className="ml-2">Loading preview...</span>
                  </div>
                ) : previewHtml ? (
                  <div className="h-64 overflow-auto p-3 bg-white dark:bg-gray-900">
                    <iframe 
                      srcDoc={previewHtml} 
                      className="w-full h-full border-0" 
                      title="Template Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    No preview available
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2 mt-2 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPdfDialog;

import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { 
  DownloadCloud, 
  FileDown, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { Progress } from "../ui/Progress";
import { Checkbox } from "../ui/Checkbox";
import { Label } from "../ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { batchGeneratePdfReports } from '../../utils/serverPdfExport';
import { createClient } from '@supabase/supabase-js';
import { trackTemplateUsage } from '../../utils/templateAnalytics';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Report {
  id: string;
  title: string;
  report_type: string;
  selected?: boolean;
}

// Import from our templates types
import { ReportTemplate } from '../../types/templates';

interface BatchPDFExportProps {
  reports: Report[];
  templates?: ReportTemplate[];
  className?: string;
}

interface ExportResult {
  success: {
    reportId: string;
    title: string;
    url: string;
  }[];
  failed: {
    reportId: string;
    title: string;
  }[];
}

const BatchPDFExport = ({ reports, templates = [], className = '' }: BatchPDFExportProps) => {
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [exportResults, setExportResults] = useState<ExportResult>({ 
    success: [], 
    failed: [] 
  });
  const [availableTemplates, setAvailableTemplates] = useState<ReportTemplate[]>(templates);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Fetch templates from database if none provided via props
  useEffect(() => {
    if (templates.length === 0 && isOpen) {
      fetchTemplatesFromDatabase();
    } else {
      setAvailableTemplates(templates);
    }
  }, [templates, isOpen]);

  // Fetch templates from database
  const fetchTemplatesFromDatabase = async () => {
    setIsLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setAvailableTemplates(data);
        // Find default template if available
        const defaultTemplate = data.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load report templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleDialogOpen = (open: boolean) => {
    if (open) {
      // Initialize reports for selection
      setSelectedReports(reports.map(report => ({ ...report, selected: false })));
      
      // Find default template if available in props
      if (templates.length > 0) {
        const defaultTemplate = templates.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else {
          setSelectedTemplateId('');
        }
      }
      
      setIsOpen(true);
    } else {
      // Reset state when closing
      setIsOpen(false);
      setProgress(0);
      setExportResults({ success: [], failed: [] });
    }
  };

  const selectAllReports = (select: boolean) => {
    setSelectedReports(
      selectedReports.map(report => ({ ...report, selected: select }))
    );
  };

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(
      selectedReports.map(report => 
        report.id === reportId 
          ? { ...report, selected: !report.selected } 
          : report
      )
    );
  };

  const handleExport = async () => {
    const reportsToExport = selectedReports.filter(r => r.selected);
    if (reportsToExport.length === 0) {
      toast.error('No reports selected for export');
      return;
    }
    
    setIsExporting(true);
    setProgress(0);
    setExportResults({ success: [], failed: [] });
    
    try {
      const batchSize = 3; // Process reports in small batches
      const templateId = selectedTemplateId || undefined;
      const results: { reportId: string; downloadUrl: string }[] = [];
      let processed = 0;
      
      // Track template usage for analytics once per batch if user is logged in
      if (selectedTemplateId && user?.id && reportsToExport.length > 0) {
        // Use the first report's type as representative for the batch
        const reportType = reportsToExport[0].report_type;
        trackTemplateUsage(selectedTemplateId, user.id, reportType)
          .catch(err => console.error('Failed to track template usage:', err));
      }
      
      // Process reports in batches
      for (let i = 0; i < reportsToExport.length; i += batchSize) {
        const batch = reportsToExport.slice(i, i + batchSize).map(report => report.id);
        const batchResults = await batchGeneratePdfReports(batch, templateId);
        
        results.push(...batchResults);
        processed += batch.length;
        setProgress(Math.round((processed / reportsToExport.length) * 100));
      }
      
      // Map results to report titles
      const reportMap: Record<string, string> = {};
      selectedReports.forEach(r => {
        if (r.selected) reportMap[r.id] = r.title;
      });
      
      const successResults = results
        .filter(r => r.downloadUrl)
        .map(r => ({
          reportId: r.reportId,
          title: reportMap[r.reportId] || 'Unknown report',
          url: r.downloadUrl
        }));
      
      const failedResults = reportsToExport
        .filter(report => !results.find(r => r.reportId === report.id && r.downloadUrl))
        .map(report => ({
          reportId: report.id,
          title: report.title || 'Unknown report'
        }));
      
      // Set results for UI
      setExportResults({
        success: successResults,
        failed: failedResults
      });
      
      // Show toast notifications
      if (failedResults.length === 0) {
        toast.success(`Successfully exported ${successResults.length} PDFs`);
      } else {
        toast.success(
          `Exported ${successResults.length} PDFs, ${failedResults.length} failed`, 
          { duration: 4000 }
        );
      }
    } catch (error: any) {
      console.error('Error in batch export:', error);
      toast.error(`Failed to export PDFs: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (url: string, title: string) => {
    // Create temporary anchor
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="primary" className={className}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Batch Export PDFs
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batch PDF Export</DialogTitle>
            <DialogDescription>
              Generate PDFs for multiple reports at once.
            </DialogDescription>
          </DialogHeader>

          {isExporting ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Generating PDFs...</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
              
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            </div>
          ) : exportResults.success.length > 0 || exportResults.failed.length > 0 ? (
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {exportResults.success.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-500 flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-1" /> 
                    {exportResults.success.length} Reports Successfully Exported
                  </h3>
                  
                  <div className="space-y-2">
                    {exportResults.success.map(report => (
                      <div key={report.reportId} className="flex items-center justify-between bg-dark-800 p-2 rounded-md">
                        <span className="text-sm truncate max-w-[200px]">{report.title}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => downloadFile(report.url, report.title)}
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {exportResults.failed.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-red-500 flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 mr-1" /> 
                    {exportResults.failed.length} Reports Failed
                  </h3>
                  
                  <div className="space-y-2">
                    {exportResults.failed.map(report => (
                      <div key={report.reportId} className="flex items-center justify-between bg-dark-800 p-2 rounded-md">
                        <span className="text-sm truncate max-w-[200px]">{report.title}</span>
                        <span className="text-xs text-red-400">Failed</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setExportResults({ success: [], failed: [] })}>
                  Back
                </Button>
                <Button variant="primary" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Template selection */}
              <div className="space-y-2">
                <Label>
                  <span>Template</span>
                </Label>
                {isLoadingTemplates ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-sm text-gray-400">Loading templates...</span>
                  </div>
                ) : (
                  <>
                    <Select 
                      value={selectedTemplateId} 
                      onValueChange={setSelectedTemplateId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Default template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Default system templates</SelectItem>
                        
                        {/* Group templates by report type */}
                        {Object.entries(
                          availableTemplates.reduce<Record<string, ReportTemplate[]>>((groups, template) => {
                            const group = template.report_type;
                            groups[group] = groups[group] || [];
                            groups[group].push(template);
                            return groups;
                          }, {})
                        ).map(([reportType, reportTemplates]) => (
                          <div key={reportType}>
                            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
                              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Templates
                            </div>
                            
                            {reportTemplates.map(template => (
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
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedTemplateId && availableTemplates.find(t => t.id === selectedTemplateId)?.is_premium && (
                      <p className="text-xs text-amber-500 mt-1">
                        Using premium template - premium watermark will be removed for paying customers
                      </p>
                    )}
                  </>
                )}
              </div>
              
              {/* Report selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    <span>Select Reports</span>
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => selectAllReports(
                      !selectedReports.every(r => r.selected)
                    )}
                  >
                    {selectedReports.every(r => r.selected) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto space-y-2">
                  {selectedReports.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No reports available
                    </p>
                  ) : (
                    selectedReports.map(report => (
                      <div key={report.id} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={report.selected} 
                          onCheckedChange={() => toggleReportSelection(report.id)}
                        />
                        <Label className="text-sm cursor-pointer flex-1">
                          <span>
                            {report.title}
                            <span className="text-xs text-gray-500 block">
                              {report.report_type}
                            </span>
                          </span>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleExport}
                  disabled={!selectedReports.some(r => r.selected)}
                >
                  Export PDFs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BatchPDFExport;

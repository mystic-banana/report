import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle, 
  Star, 
  FileText, 
  Eye,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { ReportTemplate } from '../../types/templates';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TemplateManagerProps {
  onBack?: () => void;
}

const TemplateManager = ({ onBack }: TemplateManagerProps) => {
  // State
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch all templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates based on search term and active tab
  useEffect(() => {
    let filtered = [...templates];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.report_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(template => {
        switch(activeTab) {
          case 'western':
          case 'vedic':
          case 'chinese':
          case 'compatibility':
            return template.report_type === activeTab;
          case 'default':
            return template.is_default;
          case 'premium':
            return template.is_premium;
          default:
            return true;
        }
      });
    }
    
    setFilteredTemplates(filtered);
  }, [templates, searchTerm, activeTab]);

  // Fetch templates from Supabase
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch templates: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update template
  const saveTemplate = async (template: ReportTemplate) => {
    try {
      const isNew = !template.id;
      const { data, error } = isNew
        ? await supabase
            .from('report_templates')
            .insert([{
              name: template.name,
              description: template.description,
              report_type: template.report_type,
              template_content: template.template_content,
              is_default: template.is_default,
              is_premium: template.is_premium
            }])
            .select()
        : await supabase
            .from('report_templates')
            .update({
              name: template.name,
              description: template.description,
              report_type: template.report_type,
              template_content: template.template_content,
              is_default: template.is_default,
              is_premium: template.is_premium
            })
            .eq('id', template.id)
            .select();
      
      if (error) throw error;
      
      toast.success(`Template ${isNew ? 'created' : 'updated'} successfully`);
      fetchTemplates();
      setIsEditorOpen(false);
    } catch (error: any) {
      toast.error(`Failed to save template: ${error.message}`);
    }
  };

  // Delete template
  const deleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', selectedTemplate.id);
      
      if (error) throw error;
      
      toast.success('Template deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast.error(`Failed to delete template: ${error.message}`);
    }
  };

  // Set template as default
  const setAsDefault = async (template: ReportTemplate) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .update({ is_default: true })
        .eq('id', template.id);
      
      if (error) throw error;
      
      toast.success(`Set as default template for ${template.report_type} reports`);
      fetchTemplates();
    } catch (error: any) {
      toast.error(`Failed to set default template: ${error.message}`);
    }
  };

  // Duplicate template
  const duplicateTemplate = async (template: ReportTemplate) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert([{
          name: `${template.name} (Copy)`,
          description: template.description,
          report_type: template.report_type,
          template_content: template.template_content,
          is_default: false,
          is_premium: template.is_premium
        }])
        .select();
      
      if (error) throw error;
      
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error: any) {
      toast.error(`Failed to duplicate template: ${error.message}`);
    }
  };

  // Handle opening the template editor
  const handleEditTemplate = (template: ReportTemplate | null = null) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  // Handle opening the template preview
  const handlePreviewTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  // Handle template deletion confirmation
  const handleDeleteTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  // Get report type display name
  const getReportTypeDisplay = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={onBack}
              className="mb-2"
            >
              Back
            </Button>
          )}
          <h2 className="text-2xl font-bold text-white">Report Templates</h2>
          <p className="text-gray-400">Manage your PDF report templates</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={() => handleEditTemplate()}>
          New Template
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-dark-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="western">Western</TabsTrigger>
            <TabsTrigger value="vedic">Vedic</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-magazine-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-magazine-accent"></div>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-magazine-accent transition-colors"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center">
                      {template.name}
                      {template.is_default && (
                        <Star size={16} className="ml-2 text-amber-500 fill-amber-500" />
                      )}
                      {template.is_premium && (
                        <span className="ml-2 text-xs uppercase bg-magazine-accent text-white px-2 py-0.5 rounded-full">
                          Premium
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {getReportTypeDisplay(template.report_type)}
                    </p>
                  </div>
                </div>
                
                {template.description && (
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{template.description}</p>
                )}

                <div className="mt-auto pt-4 flex justify-between border-t border-dark-700">
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditTemplate(template)}
                      title="Edit template"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Eye}
                      onClick={() => handlePreviewTemplate(template)}
                      title="Preview template"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Copy}
                      onClick={() => duplicateTemplate(template)}
                      title="Duplicate template"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Trash2}
                      onClick={() => handleDeleteTemplate(template)}
                      title="Delete template"
                    />
                  </div>
                  
                  {!template.is_default && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-amber-500"
                      onClick={() => setAsDefault(template)}
                      title="Set as default"
                    >
                      Set Default
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-800 rounded-lg border border-dark-700">
          <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No templates found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm
              ? `No templates match "${searchTerm}"`
              : activeTab !== 'all'
              ? `No templates in the "${activeTab}" category`
              : "Start by creating your first template"}
          </p>
          <Button 
            variant="primary" 
            size="md" 
            icon={Plus}
            onClick={() => handleEditTemplate()}
          >
            Create Template
          </Button>
        </div>
      )}

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          {isEditorOpen && (
            <TemplateEditor
              template={selectedTemplate}
              onSave={saveTemplate}
              onCancel={() => setIsEditorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {isPreviewOpen && selectedTemplate && (
            <TemplatePreview
              template={selectedTemplate}
              onClose={() => setIsPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">
            Are you sure you want to delete the template "{selectedTemplate?.name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2}
              onClick={deleteTemplate}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Placeholder for TemplateEditor component
const TemplateEditor = ({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: ReportTemplate | null;
  onSave: (template: ReportTemplate) => void;
  onCancel: () => void;
}) => {
  // This is a placeholder. You'll implement the actual editor separately
  // We'll handle the editor implementation in the next step
  return <div>Template Editor Placeholder</div>;
};

// Placeholder for TemplatePreview component
const TemplatePreview = ({
  template,
  onClose
}: {
  template: ReportTemplate;
  onClose: () => void;
}) => {
  // This is a placeholder. You'll implement the actual preview separately
  return <div>Template Preview Placeholder</div>;
};

export default TemplateManager;

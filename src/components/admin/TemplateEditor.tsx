import { useState, useEffect } from 'react';
import { Save, Eye, Code } from 'lucide-react';
import Button from '../ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { ReportTemplate } from '../../types/templates';
import TemplatePreview from './TemplatePreview';

interface TemplateEditorProps {
  template: ReportTemplate | null;
  onSave: (template: ReportTemplate) => void;
  onCancel: () => void;
}

// Sample data for template preview
const sampleData = {
  REPORT_TITLE: "Astrological Birth Chart Analysis",
  REPORT_TYPE: "Western",
  PERSON_NAME: "Jane Doe",
  BIRTH_DATE: "January 15, 1990",
  BIRTH_TIME: "08:30 AM",
  BIRTH_LOCATION: "New York, NY, USA",
  WESTERN_CHART: '<img src="https://placekitten.com/400/400" alt="Sample Chart" style="max-width: 100%;" />',
  VEDIC_CHART: '<img src="https://placekitten.com/400/400" alt="Sample Vedic Chart" style="max-width: 100%;" />',
  NAVAMSA_CHART: '<img src="https://placekitten.com/400/400" alt="Sample Navamsa Chart" style="max-width: 100%;" />',
  REPORT_CONTENT: `
    <h2 class="section-title">Sun in Leo</h2>
    <p>With your Sun in Leo, you have a natural charisma and leadership ability. You're creative, proud, and generous. Your warmth draws others to you, and you have a natural dramatic flair that can light up any room. You seek recognition and appreciation for your talents and contributions.</p>
    
    <h2 class="section-title">Moon in Cancer</h2>
    <p>Your Moon in Cancer makes you emotionally sensitive and nurturing. You have strong protective instincts, especially toward family and loved ones. Home and security are important to you, and you may have a strong connection to the past and to your roots.</p>
    
    <h2 class="section-title">Mercury in Virgo</h2>
    <p>Mercury in Virgo gives you a precise, analytical mind. You pay attention to details that others miss, and you have high standards for communication and information. You're practical and methodical in your thinking, and you have a talent for critical analysis and problem-solving.</p>
  `,
  GENERATION_DATE: new Date().toLocaleDateString(),
  CURRENT_YEAR: new Date().getFullYear().toString()
};

const reportTypes = [
  { value: 'western', label: 'Western Astrology' },
  { value: 'vedic', label: 'Vedic Astrology' },
  { value: 'chinese', label: 'Chinese Astrology' },
  { value: 'compatibility', label: 'Compatibility Report' },
  { value: 'transit', label: 'Transit Report' },
  { value: 'solar-return', label: 'Solar Return' }
];

const TemplateEditor = ({ template, onSave, onCancel }: TemplateEditorProps) => {
  // Create default template if none provided
  const defaultTemplate = {
    id: '',
    name: '',
    description: '',
    report_type: 'western',
    template_content: `<!DOCTYPE html>
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
</html>`,
    is_default: false,
    is_premium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    thumbnail_url: null
  };

  const [formData, setFormData] = useState<ReportTemplate>(template || defaultTemplate);
  const [activeTab, setActiveTab] = useState('edit');
  const [renderedTemplate, setRenderedTemplate] = useState('');

  // Generate preview HTML when template content changes
  useEffect(() => {
    if (activeTab === 'preview') {
      let preview = formData.template_content;
      
      // Replace template variables with sample data
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        preview = preview.replace(regex, value as string);
      });
      
      setRenderedTemplate(preview);
    }
  }, [formData.template_content, activeTab]);

  // Handle form input changes
  const handleChange = (field: keyof ReportTemplate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter template name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="report_type">Report Type</Label>
          <Select
            value={formData.report_type}
            onValueChange={(value) => handleChange('report_type', value)}
          >
            <SelectTrigger id="report_type" className="w-full">
              <SelectValue placeholder="Select a report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add a description for this template"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_premium"
            checked={formData.is_premium}
            onCheckedChange={(checked) => handleChange('is_premium', Boolean(checked))}
          />
          <Label htmlFor="is_premium" className="cursor-pointer">
            Premium Template
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked) => handleChange('is_default', Boolean(checked))}
          />
          <Label htmlFor="is_default" className="cursor-pointer">
            Set as Default for {reportTypes.find(t => t.value === formData.report_type)?.label}
          </Label>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-dark-800 mb-4">
          <TabsTrigger value="edit" className="flex items-center">
            <Code size={16} className="mr-2" />
            HTML Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye size={16} className="mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-0">
          <div className="border border-dark-700 rounded-lg">
            <div className="bg-dark-900 text-xs text-gray-400 px-4 py-2 border-b border-dark-700">
              <p>Use double curly braces to include variables: <code>{'{{VARIABLE_NAME}}'}</code></p>
              <div className="mt-1 flex flex-wrap gap-2">
                Available variables: 
                {Object.keys(sampleData).map((variable) => (
                  <code key={variable} className="bg-dark-800 px-1 rounded">{'{{' + variable + '}}'}</code>
                ))}
              </div>
            </div>
            <Textarea
              value={formData.template_content}
              onChange={(e) => handleChange('template_content', e.target.value)}
              placeholder="Enter HTML template code"
              rows={20}
              className="font-mono text-sm border-0 rounded-t-none"
              required
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="border border-dark-700 rounded-lg">
            <div className="bg-dark-900 text-xs text-gray-400 px-4 py-2 border-b border-dark-700">
              Preview with sample data
            </div>
            <div className="bg-white p-4 h-[600px] overflow-auto">
              <iframe
                srcDoc={renderedTemplate}
                title="Template Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t border-dark-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={Save}>
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};

export default TemplateEditor;

import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { ReportTemplate } from '../../types/templates';

interface TemplatePreviewProps {
  template: ReportTemplate;
  onClose?: () => void;
  sampleData?: Record<string, string>;
}

// Default sample data for template preview
const defaultSampleData = {
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

const TemplatePreview = ({ 
  template, 
  onClose,
  sampleData = defaultSampleData 
}: TemplatePreviewProps) => {
  const [renderedTemplate, setRenderedTemplate] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate preview HTML when template content or sample data changes
  useEffect(() => {
    let preview = template.template_content;
    
    // Replace template variables with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(regex, value as string);
    });
    
    setRenderedTemplate(preview);
  }, [template.template_content, sampleData]);

  // Handle toggling fullscreen preview
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Download template as HTML file
  const downloadTemplate = () => {
    const element = document.createElement("a");
    const file = new Blob([template.template_content], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-dark-900 p-6' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">{template.name}</h3>
          <p className="text-sm text-gray-400">{template.report_type} Template</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadTemplate}
          >
            Download HTML
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          {onClose && !isFullscreen && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="border border-dark-700 rounded-lg flex-grow">
        <div className="bg-dark-900 text-xs text-gray-400 px-4 py-2 border-b border-dark-700">
          Preview with sample data
        </div>
        <div className={`bg-white overflow-auto ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
          <iframe
            srcDoc={renderedTemplate}
            title="Template Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string | null;
  report_type: string;
  template_content: string;
  is_default: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  thumbnail_url: string | null;
}

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

// Available template variables by report type
export const templateVariables: Record<string, TemplateVariable[]> = {
  common: [
    { name: 'REPORT_TITLE', description: 'Title of the report', example: 'Astrological Birth Chart Analysis' },
    { name: 'REPORT_TYPE', description: 'Type of report (Western, Vedic, etc.)', example: 'Western' },
    { name: 'PERSON_NAME', description: 'Name of the subject', example: 'Jane Doe' },
    { name: 'BIRTH_DATE', description: 'Birth date of the subject', example: 'January 15, 1990' },
    { name: 'BIRTH_TIME', description: 'Birth time of the subject', example: '08:30 AM' },
    { name: 'BIRTH_LOCATION', description: 'Birth location of the subject', example: 'New York, NY, USA' },
    { name: 'REPORT_CONTENT', description: 'Main report content', example: '<p>Report content goes here...</p>' },
    { name: 'GENERATION_DATE', description: 'Date the report was generated', example: 'June 7, 2025' },
    { name: 'CURRENT_YEAR', description: 'Current year', example: '2025' },
  ],
  western: [
    { name: 'WESTERN_CHART', description: 'Western astrology chart image', example: '<img src="chart.jpg" alt="Western Chart" />' },
  ],
  vedic: [
    { name: 'VEDIC_CHART', description: 'Vedic astrology chart image', example: '<img src="chart.jpg" alt="Vedic Chart" />' },
    { name: 'NAVAMSA_CHART', description: 'Navamsa chart image', example: '<img src="chart.jpg" alt="Navamsa Chart" />' },
  ],
  chinese: [
    { name: 'CHINESE_CHART', description: 'Chinese astrology chart image', example: '<img src="chart.jpg" alt="Chinese Chart" />' },
    { name: 'CHINESE_YEAR', description: 'Chinese zodiac year', example: 'Year of the Tiger' },
  ],
  compatibility: [
    { name: 'PERSON1_NAME', description: 'First person name', example: 'Jane Doe' },
    { name: 'PERSON2_NAME', description: 'Second person name', example: 'John Smith' },
    { name: 'PERSON1_CHART', description: 'First person chart image', example: '<img src="chart.jpg" alt="Chart 1" />' },
    { name: 'PERSON2_CHART', description: 'Second person chart image', example: '<img src="chart.jpg" alt="Chart 2" />' },
    { name: 'COMPOSITE_CHART', description: 'Composite chart image', example: '<img src="chart.jpg" alt="Composite Chart" />' },
    { name: 'SYNASTRY_CHART', description: 'Synastry chart image', example: '<img src="chart.jpg" alt="Synastry Chart" />' },
  ],
  transit: [
    { name: 'TRANSIT_DATE', description: 'Date of transit', example: 'June 7, 2025' },
    { name: 'TRANSIT_CHART', description: 'Transit chart image', example: '<img src="chart.jpg" alt="Transit Chart" />' },
  ]
};

// Get all available template variables for a report type
export const getTemplateVariablesForType = (reportType: string): TemplateVariable[] => {
  return [
    ...templateVariables.common,
    ...(templateVariables[reportType] || [])
  ];
};

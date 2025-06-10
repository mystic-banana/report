// Template management for PDF report generation
// These are default templates used when no custom template is specified

// Base template for all report types with CSS styling
const baseTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{REPORT_TITLE}}</title>
  <style>
    /* Base styling */
    :root {
      --primary-color: #7E57C2;
      --secondary-color: #4A148C;
      --accent-color: #9C27B0;
      --background-color: #FFFFFF;
      --text-color: #1A1A2E;
      --section-bg: #F5F5F7;
      --border-color: #E0E0E0;
      --chart-bg: #F9F7FF;
      --shadow-color: rgba(0, 0, 0, 0.05);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      line-height: 1.6;
      font-size: 11pt;
    }

    /* Header section */
    .report-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: white;
      border-radius: 5px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px var(--shadow-color);
    }
    
    .report-title {
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .report-subtitle {
      font-size: 14pt;
      opacity: 0.9;
    }

    /* Birth info section */
    .birth-info {
      background-color: var(--section-bg);
      border-radius: 5px;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      box-shadow: 0 2px 4px var(--shadow-color);
    }
    
    .birth-info-item {
      display: flex;
      flex-direction: column;
    }
    
    .birth-info-label {
      font-weight: 600;
      font-size: 9pt;
      color: var(--secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .birth-info-value {
      font-size: 11pt;
    }
    
    /* Chart display */
    .chart-container {
      background-color: var(--chart-bg);
      border-radius: 5px;
      padding: 1rem;
      margin-bottom: 2rem;
      text-align: center;
      box-shadow: 0 2px 4px var(--shadow-color);
    }
    
    /* Report content */
    .report-content {
      margin-bottom: 2rem;
    }
    
    .report-section {
      margin-bottom: 1.5rem;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }
    
    .section-content p {
      margin-bottom: 0.75rem;
      text-align: justify;
    }
    
    /* Footer */
    .report-footer {
      text-align: center;
      font-size: 9pt;
      color: #666;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    /* Page break control */
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    
    @page {
      size: A4;
      margin: 2cm;
    }
    
    /* Responsive adjustments for PDF */
    @media print {
      body {
        font-size: 11pt;
      }
      
      .report-section {
        page-break-inside: avoid;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      img, table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1 class="report-title">{{REPORT_TITLE}}</h1>
    <div class="report-subtitle">{{REPORT_TYPE}} Report</div>
  </div>
  
  <div class="birth-info">
    <div class="birth-info-item">
      <span class="birth-info-label">Name</span>
      <span class="birth-info-value">{{PERSON_NAME}}</span>
    </div>
    <div class="birth-info-item">
      <span class="birth-info-label">Birth Date</span>
      <span class="birth-info-value">{{BIRTH_DATE}}</span>
    </div>
    <div class="birth-info-item">
      <span class="birth-info-label">Birth Time</span>
      <span class="birth-info-value">{{BIRTH_TIME}}</span>
    </div>
    <div class="birth-info-item">
      <span class="birth-info-label">Birth Location</span>
      <span class="birth-info-value">{{BIRTH_LOCATION}}</span>
    </div>
  </div>
  
  <div class="report-content">
    {{REPORT_CONTENT}}
  </div>
  
  <div class="report-footer">
    Generated on {{GENERATION_DATE}} by Mystic Banana Astrology
    <br>
    © ${new Date().getFullYear()} Mystic Banana Astro - All Rights Reserved
  </div>
</body>
</html>`;

// Specialized template for Western astrology reports
const westernTemplate = baseTemplate.replace('{{REPORT_CONTENT}}', `
  <div class="chart-container">
    <div class="chart-title">Natal Chart</div>
    {{WESTERN_CHART}}
  </div>
  
  {{REPORT_CONTENT}}
`);

// Specialized template for Vedic astrology reports
const vedicTemplate = baseTemplate.replace('{{REPORT_CONTENT}}', `
  <div class="chart-container">
    <div class="chart-title">Vedic Birth Chart</div>
    {{VEDIC_CHART}}
  </div>
  
  <div class="chart-container">
    <div class="chart-title">Navamsa Chart</div>
    {{NAVAMSA_CHART}}
  </div>
  
  {{REPORT_CONTENT}}
`);

// Specialized template for Chinese astrology reports
const chineseTemplate = baseTemplate.replace('{{REPORT_CONTENT}}', `
  <div class="chart-container">
    <div class="chart-title">Chinese Birth Chart</div>
    {{CHINESE_CHART}}
  </div>
  
  {{REPORT_CONTENT}}
`);

// Specialized template for Hellenistic astrology reports
const hellenisticTemplate = baseTemplate.replace('{{REPORT_CONTENT}}', `
  <div class="chart-container">
    <div class="chart-title">Hellenistic Chart</div>
    {{HELLENISTIC_CHART}}
  </div>
  
  {{REPORT_CONTENT}}
`);

// Specialized template for compatibility reports
const compatibilityTemplate = baseTemplate.replace('{{REPORT_CONTENT}}', `
  <div style="display: flex; justify-content: space-between; gap: 1rem;">
    <div class="chart-container" style="flex: 1;">
      <div class="chart-title">Person 1 Chart</div>
      {{CHART_PERSON_1}}
    </div>
    <div class="chart-container" style="flex: 1;">
      <div class="chart-title">Person 2 Chart</div>
      {{CHART_PERSON_2}}
    </div>
  </div>
  
  <div class="chart-container">
    <div class="chart-title">Compatibility Chart</div>
    {{COMPATIBILITY_CHART}}
  </div>
  
  {{REPORT_CONTENT}}
`);

// Specialized template for transit reports
const transitTemplate = baseTemplate.replace('{{REPORT_CONTENT}}', `
  <div class="chart-container">
    <div class="chart-title">Natal Chart</div>
    {{NATAL_CHART}}
  </div>
  
  <div class="chart-container">
    <div class="chart-title">Transit Chart</div>
    {{TRANSIT_CHART}}
  </div>
  
  {{REPORT_CONTENT}}
`);

// Function to get the appropriate template based on report type
export function getReportTemplate(reportType: string): string {
  if (!reportType) return baseTemplate;
  
  const type = reportType.toLowerCase();
  
  if (type.includes('western')) {
    return westernTemplate;
  } else if (type.includes('vedic')) {
    return vedicTemplate;
  } else if (type.includes('chinese')) {
    return chineseTemplate;
  } else if (type.includes('hellenistic')) {
    return hellenisticTemplate;
  } else if (type.includes('compatibility')) {
    return compatibilityTemplate;
  } else if (type.includes('transit')) {
    return transitTemplate;
  }
  
  return baseTemplate;
}

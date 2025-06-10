import { createClient } from '@supabase/supabase-js';

// Define the API route interface since Astro types aren't available in the editor
interface APIContext {
  request: Request;
  params: Record<string, string>;
  url: URL;
}

type APIRoute = (context: APIContext) => Promise<Response>;

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample data to use when no specific report is provided
const SAMPLE_DATA = {
  title: "Sample Natal Chart Report",
  content: "**Sun Sign Analysis**\nThe Sun in Taurus gives you a steady, reliable nature. You value security and comfort, and have a deep appreciation for beauty and quality. You're patient and determined, but can sometimes be stubborn.\n\n**Moon Sign Analysis**\nWith the Moon in Cancer, your emotions run deep. You're sensitive and nurturing, with a strong need for security and a safe home environment. You have excellent intuition and a good memory.\n\n**Rising Sign**\nYour Virgo Ascendant gives you an analytical approach to life. You present yourself as practical, detail-oriented, and hardworking. Others see you as reliable and intelligent.",
  report_type: "natal-chart",
  created_at: new Date().toISOString(),
  birth_charts: {
    name: "Sample Person",
    birth_date: "1990-05-15",
    birth_time: "08:30",
    birth_location: { city: "New York", country: "USA" },
    chart_data: {
      planets: {
        sun: { sign: "Taurus", degree: 24.5 },
        moon: { sign: "Cancer", degree: 15.2 },
        mercury: { sign: "Taurus", degree: 10.8 },
        venus: { sign: "Aries", degree: 28.3 },
        mars: { sign: "Aquarius", degree: 5.7 },
        jupiter: { sign: "Cancer", degree: 2.1 },
        saturn: { sign: "Capricorn", degree: 18.9 },
        uranus: { sign: "Capricorn", degree: 9.3 },
        neptune: { sign: "Capricorn", degree: 13.2 },
        pluto: { sign: "Scorpio", degree: 15.8 }
      },
      houses: [
        { sign: "Virgo", degree: 15 },
        { sign: "Libra", degree: 12 },
        { sign: "Scorpio", degree: 10 },
        { sign: "Sagittarius", degree: 8 },
        { sign: "Capricorn", degree: 9 },
        { sign: "Aquarius", degree: 11 },
        { sign: "Pisces", degree: 15 },
        { sign: "Aries", degree: 12 },
        { sign: "Taurus", degree: 10 },
        { sign: "Gemini", degree: 8 },
        { sign: "Cancer", degree: 9 },
        { sign: "Leo", degree: 11 }
      ],
      aspects: [
        { planet1: "sun", planet2: "moon", aspect: "trine", orb: 2.3 },
        { planet1: "venus", planet2: "mars", aspect: "square", orb: 1.5 },
        { planet1: "mercury", planet2: "jupiter", aspect: "opposition", orb: 3.2 }
      ]
    }
  },
  user_profiles: {
    display_name: "Sample User",
    avatar_url: "https://example.com/avatar.png",
    subscription_tier: "premium"
  }
};

// Process the template with report data
function processTemplate(template: string, reportData: any): string {
  let processedTemplate = template;
  
  // Replace basic placeholders
  const placeholders = {
    "{{REPORT_TITLE}}": reportData.title || "Astrological Report",
    "{{PERSON_NAME}}": reportData.birth_charts?.name || "Unknown",
    "{{BIRTH_DATE}}": reportData.birth_charts?.birth_date ? formatDate(reportData.birth_charts.birth_date) : "Unknown",
    "{{BIRTH_TIME}}": reportData.birth_charts?.birth_time || "Unknown",
    "{{BIRTH_LOCATION}}": reportData.birth_charts?.birth_location ? 
      `${reportData.birth_charts.birth_location.city}, ${reportData.birth_charts.birth_location.country}` : "Unknown",
    "{{REPORT_TYPE}}": formatReportType(reportData.report_type),
    "{{GENERATION_DATE}}": formatDate(new Date().toISOString()),
    "{{REPORT_CONTENT}}": processReportContent(reportData.content)
  };
  
  // Replace each placeholder
  for (const [placeholder, value] of Object.entries(placeholders)) {
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, "g"), value);
  }
  
  return processedTemplate;
}

// Format the report content into structured HTML
function processReportContent(content: string): string {
  if (!content) return "";
  
  // Split by markdown headers
  const sections = content.split(/\*\*([^*]+)\*\*/);
  let processedContent = "";
  
  for (let i = 1; i < sections.length; i += 2) {
    const title = sections[i];
    const body = sections[i + 1] || "";
    
    // Create a section with title and formatted body
    processedContent += `
      <div class="report-section">
        <h2 class="section-title">${title}</h2>
        <div class="section-content">
          ${formatTextContent(body)}
        </div>
      </div>
    `;
  }
  
  return processedContent;
}

// Format plain text into HTML paragraphs
function formatTextContent(text: string): string {
  if (!text) return "";
  return text
    .split(/\n\n+/)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Format report type for display
function formatReportType(type: string): string {
  if (!type) return "Astrological";
  
  return type
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Format date for display
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (e) {
    return dateString;
  }
}

export const POST: APIRoute = async ({ request }: { request: Request }) => {
  try {
    const { templateId, reportId } = await request.json();
    
    if (!templateId) {
      return new Response(
        JSON.stringify({ error: 'Template ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }
    
    // Get the template HTML content
    const { data: templateData, error: templateError } = await supabase
      .from('report_templates')
      .select('html_content')
      .eq('id', templateId)
      .single();
      
    if (templateError || !templateData) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }
    
    // Try to get the actual report data if reportId was provided
    let reportData = SAMPLE_DATA;
    if (reportId) {
      const { data, error } = await supabase
        .from("astrology_reports")
        .select(`
          *,
          birth_charts!inner(
            name, 
            birth_date, 
            birth_time, 
            birth_location, 
            chart_data
          ),
          user_profiles!inner(
            display_name,
            avatar_url,
            subscription_tier
          )
        `)
        .eq("id", reportId)
        .single();
        
      if (data && !error) {
        reportData = data;
      }
    }
    
    // Process the template with the report data
    const previewHtml = processTemplate(templateData.html_content, reportData);
    
    // Add preview wrapper with styles
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Template Preview</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #333;
            line-height: 1.5;
            padding: 0;
            margin: 0;
            font-size: 14px;
          }
          .preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: rgba(255, 152, 0, 0.8);
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            z-index: 100;
          }
          .template-container {
            position: relative;
            transform: scale(0.8);
            transform-origin: top center;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="preview-badge">Preview</div>
        <div class="template-container">
          ${previewHtml}
        </div>
      </body>
      </html>
    `;
    
    return new Response(
      JSON.stringify({ 
        data: { previewHtml: wrappedHtml }, 
        success: true 
      }),
      { headers: { 'Content-Type': 'application/json' }}
    );
    
  } catch (error: unknown) {
    console.error('Template preview error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate template preview';
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getReportTemplate } from "./templates.ts";

interface PDFGenerationRequest {
  reportId: string;
  templateId?: string | null;
  templateContent?: string | null;
  options?: {
    format?: string;
    landscape?: boolean;
    printBackground?: boolean;
    preferCssPageSize?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    headerTemplate?: string;
    footerTemplate?: string;
    displayHeaderFooter?: boolean;
  };
  // Browser info for diagnostics and browser-specific handling
  browserInfo?: {
    name: string;
    version: string;
    userAgent: string;
  };
  // Mock data for testing without database access
  mockData?: {
    reportData: any;
    userProfile: any;
    isMockReport: boolean;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  let browser: any = null;
  let debugScreenshotPath: string | null = null;
  
  try {
    // Safely parse request JSON with error handling
    let requestData: PDFGenerationRequest;
    try {
      requestData = await req.json() as PDFGenerationRequest;
    } catch (jsonError) {
      console.error("Error parsing request JSON:", jsonError);
      return new Response(JSON.stringify({
        success: false,
        error: `Failed to parse request JSON: ${jsonError.message}`,
        errorDetails: { message: jsonError.message, name: jsonError.name }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    
    const { reportId, templateId, templateContent, options = {}, browserInfo, mockData } = requestData;
    
    // Validate required fields
    if (!reportId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Report ID is required",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    
    // Log request with browser info for diagnostics
    console.log(`PDF Generation Request - Browser: ${browserInfo?.name || 'Unknown'} ${browserInfo?.version || ''}, Report ID: ${reportId}, Using Mock Data: ${!!mockData}`);
    
    // Determine if we're using mock data for testing
    const isMockTest = Boolean(mockData && mockData.isMockReport);

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false }
      }
    );
    
    // Determine if using mock data or fetching from database
    let reportData: any;
    
    if (isMockTest && mockData) {
      console.log("Using mock report data for testing");
      reportData = {
        id: reportId,
        title: "Mock Astrological Report",
        report_type: "mock-test-report",
        content: "**Introduction**\n\nThis is a test report generated from mock data.\n\n**Analysis**\n\nThis mock report is designed to test cross-browser PDF generation functionality.\n\n**Conclusion**\n\nIf you can see this PDF, the test was successful!",
        created_at: new Date().toISOString(),
        birth_charts: mockData.reportData,
        user_profiles: mockData.userProfile
      };
    } else {
      // Normal database fetch
      const { data: dbReportData, error: reportError } = await supabaseClient
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
      
      if (reportError) {
        console.error("Report fetch error:", reportError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch report: ${reportError.message}`,
          errorDetails: {
            message: reportError.message,
            code: reportError.code,
            reportId: reportId
          }
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 });
      }
      
      if (!dbReportData) {
        console.error("No report data found for ID:", reportId);
        return new Response(JSON.stringify({
          success: false,
          error: `Report not found with ID: ${reportId}`,
          errorDetails: { reportId }
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 });
      }
      
      reportData = dbReportData;
    }
    
    console.log("Using report data:", JSON.stringify({
      id: reportData.id,
      title: reportData.title,
      report_type: reportData.report_type,
      isMockData: isMockTest
    }));

    // Determine which template to use
    let template;
    
    // First priority: Use provided template content directly if available
    if (templateContent) {
      template = templateContent;
      console.log("Using provided template content");
    } 
    // Second priority: Look up template by ID in the database
    else if (templateId) {
      const { data: templateData, error: templateError } = await supabaseClient
        .from("report_templates")
        .select("html_content")
        .eq("id", templateId)
        .single();
        
      if (templateError) {
        console.warn("Error fetching template:", templateError.message);
      } else if (templateData?.html_content) {
        template = templateData.html_content;
        console.log("Using database template with ID:", templateId);
      }
    }

    // Third priority: Fetch the default template for this report type from database
    if (!template) {
      const { data: defaultTemplate } = await supabaseClient
        .from("report_templates")
        .select("html_content")
        .eq("report_type", reportData.report_type)
        .eq("is_default", true)
        .single();
        
      if (defaultTemplate?.html_content) {
        template = defaultTemplate.html_content;
        console.log("Using default template from database for report type:", reportData.report_type);
      }
    }
    
    // Last resort: Use built-in templates if nothing found in the database
    if (!template) {
      template = getReportTemplate(reportData.report_type);
      console.log("Using built-in template for report type:", reportData.report_type);
    }
    
    // Process the report data through the template
    const htmlContent = processTemplate(template, reportData);
    
    // Generate PDF using Puppeteer with browser-specific configuration
    console.log("Starting Puppeteer for PDF generation...");
    
    // Prepare browser launch options based on client browser
    const launchOptions = {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true
    };
    
    if (browserInfo?.name === "Safari") {
      console.log("Using Safari-optimized configuration");
      // Add Safari-specific args if needed
      launchOptions.args.push(
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process"
      );
    }
    
    // Launch browser with optimized options
    browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage();
    
    // Optimize viewport based on options or default to standard size
    await page.setViewport({
      width: 1000, // Increased width for better rendering
      height: 1414, // A4 height at 96 DPI
      deviceScaleFactor: 2, // Higher resolution for better quality
    });
    
    // Create full HTML document with minimal but sufficient styling
    const htmlWithStyles = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Astrology Report</title>
        <style>
          @page {
            margin: 0;
            size: A4;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 40px;
            line-height: 1.5;
            color: #333;
          }
          h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }
          p { margin-bottom: 1em; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    // Log HTML size for debugging
    console.log(`HTML content size: ${htmlWithStyles.length} bytes`);
    
    // Content loading with proper wait strategies
    console.log("Setting page content and waiting for full render...");
    await page.setContent(htmlWithStyles, {
      waitUntil: "networkidle0" // Wait until network is completely idle
    });
    
    // Take a debug screenshot to verify content rendering
    try {
      console.log("Taking debug screenshot...");
      const screenshotBuffer = await page.screenshot({ 
        fullPage: true,
        type: "jpeg",
        quality: 80
      });
      
      // Upload screenshot for debugging
      const screenshotTimestamp = Date.now();
      debugScreenshotPath = `debug/report-${reportId}-${screenshotTimestamp}.jpg`;
      
      const { error: screenshotError } = await supabaseClient
        .storage
        .from("report-pdfs")
        .upload(debugScreenshotPath, screenshotBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600"
        });
        
      if (screenshotError) {
        console.warn("Failed to upload debug screenshot:", screenshotError.message);
      } else {
        console.log("Debug screenshot saved to:", debugScreenshotPath);
      }
    } catch (screenshotError) {
      console.warn("Failed to take debug screenshot:", screenshotError);
    }
    
    // Wait extra time for any browser-specific rendering to complete
    console.log("Waiting for additional render time...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // PDF generation options - browser-specific options
    const pdfOptions: any = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm"
      },
      displayHeaderFooter: false,
      timeout: 90000, // Increased timeout for PDF generation
    };
    
    // Apply browser-specific optimizations
    if (browserInfo?.name === "Safari") {
      // Safari tends to work better with these settings
      pdfOptions.scale = 1.0;
      pdfOptions.preferCssPageSize = false;
    }
    
    // Merge with any user-provided options
    Object.assign(pdfOptions, options);
    
    console.log(`Generating PDF with options:`, JSON.stringify(pdfOptions));
    
    // Multiple attempts with different strategies if needed
    let pdfBuffer;
    let attempt = 1;
    const maxAttempts = 3;
    
    while (attempt <= maxAttempts && !pdfBuffer) {
      try {
        console.log(`PDF generation attempt ${attempt}/${maxAttempts}...`);
        
        // Generate the PDF with progressively simplified options on retry
        if (attempt === 1) {
          // First attempt with full options
          pdfBuffer = await page.pdf(pdfOptions);
        } else if (attempt === 2) {
          // Second attempt with simplified options
          const simpleOptions = {
            ...pdfOptions,
            scale: 1.0,
            printBackground: true,
            preferCssPageSize: false
          };
          pdfBuffer = await page.pdf(simpleOptions);
        } else {
          // Last attempt with absolute minimal options
          pdfBuffer = await page.pdf({
            format: "A4",
            margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" }
          });
        }
        
        if (pdfBuffer && pdfBuffer.length > 1000) { // Ensure PDF has reasonable size
          console.log(`PDF generation successful on attempt ${attempt}, size: ${pdfBuffer.length} bytes`);
          break;
        } else {
          console.warn(`Generated PDF too small on attempt ${attempt}, size: ${pdfBuffer?.length || 0} bytes. Retrying...`);
          pdfBuffer = null; // Reset for retry
        }
      } catch (error) {
        console.error(`PDF generation failed on attempt ${attempt}:`, error);
        
        if (attempt === maxAttempts) {
          throw new Error(`Failed to generate PDF after ${maxAttempts} attempts: ${error.message}`);
        }
      }
      
      attempt++;
    }
    
    if (browser !== null) {
      console.log("Closing browser...");
      await browser.close();
      browser = null;
    }
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const filename = `report-${reportId}-${timestamp}.pdf`;
    const filePath = `reports/${filename}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from("report-pdfs")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600"
      });
      
    if (uploadError) {
      throw new Error(`Error uploading PDF: ${uploadError.message}`);
    }
    
    // Get a signed URL for the uploaded file
    const { data: urlData } = await supabaseClient
      .storage
      .from("report-pdfs")
      .createSignedUrl(filePath, 60 * 60 * 24); // 24 hour expiry
      
    // Save the PDF reference in the database
    await supabaseClient
      .from("report_pdfs")
      .insert({
        report_id: reportId,
        template_id: templateId, // Store which template was used
        file_path: filePath,
        created_at: new Date().toISOString()
      });
      
    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF report generated successfully",
        downloadUrl: urlData?.signedUrl,
        pdfPath: filePath
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("PDF Generation Error:", error);
    
    // Close browser if it's still open
    if (browser !== null) {
      try {
        await browser.close();
      } catch (closingError) {
        console.error("Error closing browser:", closingError);
      }
    }
    
    // Include more detailed error information
    const errorDetails = {
      message: error.message || "Failed to generate PDF report",
      stack: error.stack ? error.stack.split("\n").slice(0, 3).join("\n") : "",
      name: error.name,
      processingTime: Date.now() - startTime,
      debugScreenshotPath
    };
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate PDF report",
        errorDetails,
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

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
  
  // Process special sections if available
  if (reportData.birth_charts?.chart_data) {
    processedTemplate = processChartData(processedTemplate, reportData.birth_charts.chart_data);
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

// Process chart data into visual elements
function processChartData(template: string, chartData: any): string {
  // This would be expanded to generate chart visualizations
  // For now, just return the template
  return template;
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

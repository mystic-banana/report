import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { ReportTemplate } from "../types/templates";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface for PDF generation options
export interface PDFGenerationOptions {
  format?: string;
  landscape?: boolean;
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

// Interface for PDF generation request
export interface PdfGenerationRequest {
  reportId: string;
  templateId?: string;
  options?: PDFGenerationOptions;
  templateContent?: string; // Optional HTML content for the template
  browserInfo?: {
    name: string;
    version: string;
    userAgent: string;
  };
}

// Interface for PDF generation response
interface PDFGenerationResponse {
  success: boolean;
  message?: string;
  error?: string;
  downloadUrl?: string;
  pdfPath?: string;
}

/**
 * Generate a PDF report on the server and return a download URL
 * @param reportId The ID of the report to generate a PDF for
 * @param templateId Optional template ID to use for the report
 * @param options PDF generation options
 * @returns Promise resolving to the PDF download URL
 */
/**
 * Detect browser type for diagnostics
 * @returns Browser name and version info
 */
function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "";
  
  // Safari detection
  if (userAgent.match(/Safari/) && !userAgent.match(/Chrome/) && !userAgent.match(/Chromium/)) {
    browserName = "Safari";
    const versionMatch = userAgent.match(/Version\/(\d+\.\d+)/);
    browserVersion = versionMatch ? versionMatch[1] : "";
  } 
  // Chrome detection
  else if (userAgent.match(/Chrome/) && !userAgent.match(/Edg/)) {
    browserName = "Chrome";
    const versionMatch = userAgent.match(/Chrome\/(\d+\.\d+)/);
    browserVersion = versionMatch ? versionMatch[1] : "";
  } 
  // Edge detection
  else if (userAgent.match(/Edg/)) {
    browserName = "Edge";
    const versionMatch = userAgent.match(/Edg\/(\d+\.\d+)/);
    browserVersion = versionMatch ? versionMatch[1] : "";
  } 
  // Firefox detection
  else if (userAgent.match(/Firefox/)) {
    browserName = "Firefox";
    const versionMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
    browserVersion = versionMatch ? versionMatch[1] : "";
  }
  
  return { browserName, browserVersion, userAgent };
}

export interface MockReportData {
  mockData?: {
    reportData: any;
    userProfile: any;
    isMockReport: boolean;
  };
}

export async function generatePdfReport(
  reportId: string,
  templateId?: string,
  options?: PDFGenerationOptions,
  templateContent?: string,
  mockDataParam?: MockReportData
): Promise<string | null> {
  try {
    // Get browser info for diagnostics
    const browserInfo = detectBrowser();
    console.log(`PDF Generation - Browser: ${browserInfo.browserName} ${browserInfo.browserVersion}`);
    
    toast.loading("Generating PDF report...");

    // If templateId is provided but no templateContent, try to fetch it
    if (templateId && !templateContent) {
      const { data: templateData, error: templateError } = await supabase
        .from("report_templates")
        .select("html_content, report_type")
        .eq("id", templateId)
        .single();
      
      if (templateError) {
        console.warn("Failed to fetch template, falling back to default:", templateError);
      } else if (templateData) {
        templateContent = templateData.html_content;
      }
    }

    // Create a timestamp for tracking response time
    const startTime = Date.now();
    console.log(`PDF Generation - Started at ${new Date().toISOString()} for report ${reportId}`);
    
    // Add browser info to the request for server-side diagnostics
    const requestBody: PdfGenerationRequest & any = {
      reportId,
      templateId,
      templateContent,
      options,
      browserInfo: {
        name: browserInfo.browserName,
        version: browserInfo.browserVersion,
        userAgent: browserInfo.userAgent
      }
    };
    
    // If mock data is provided, include it in the request
    if (mockDataParam?.mockData) {
      console.log('Using mock data for PDF generation');
      requestBody.mockData = mockDataParam.mockData;
    }

    // Call the Supabase Edge Function to generate the PDF
    console.log(`PDF Generation - Sending request to Edge Function`, {
      reportId,
      templateId,
      hasTemplateContent: !!templateContent,
      options
    });
    
    const { data, error } = await supabase.functions.invoke<PDFGenerationResponse>(
      "generate-pdf-report",
      {
        body: JSON.stringify(requestBody)
      }
    );

    // Calculate response time
    const responseTime = Date.now() - startTime;
    console.log(`PDF Generation - Completed in ${responseTime}ms`);

    if (error) {
      toast.error(`Error generating PDF: ${error.message}`);
      console.error("PDF generation error:", error);
      console.error(`PDF Generation Failed - Browser: ${browserInfo.browserName}, Error: ${error.message}`);
      return null;
    }

    if (!data || !data.success) {
      toast.error(`Failed to generate PDF: ${data?.error || "Unknown error"}`);
      console.error("PDF generation failed:", data);
      console.error(`PDF Generation Failed - Browser: ${browserInfo.browserName}, Error: ${data?.error || "Unknown error"}`);
      return null;
    }
    
    if (!data.downloadUrl) {
      toast.error("Missing download URL in response");
      console.error("PDF generation succeeded but no download URL was returned", data);
      return null;
    }

    // Verify the URL is valid
    try {
      new URL(data.downloadUrl);
    } catch (e) {
      toast.error("Invalid download URL received");
      console.error("Invalid download URL:", data.downloadUrl);
      return null;
    }

    console.log(`PDF Generation Successful - Browser: ${browserInfo.browserName}, URL: ${data.downloadUrl.substring(0, 50)}...`);
    toast.success("PDF generated successfully!");
    return data.downloadUrl;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Error: ${errorMsg}`);
    console.error("PDF generation exception:", error);
    return null;
  }
}

/**
 * Download a PDF file from a URL
 * @param url The URL to download the PDF from
 * @param filename The name to save the file as
 */
export function downloadPdf(url: string, filename: string): void {
  console.log(`Initiating PDF download: ${filename}`);
  
  // Create a hidden anchor element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "report.pdf";
  link.target = "_blank";
  
  // For Safari specific handling
  if (detectBrowser().browserName === "Safari") {
    console.log("Safari detected, using alternative download method");
    // Try to open in a new tab first for Safari
    window.open(url, "_blank");
    
    // Also try the normal download method as fallback
    setTimeout(() => {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  } else {
    // Standard approach for other browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  console.log(`Download initiated for: ${filename}`);
}

/**
 * Generate and download a PDF report
 * @param reportId The ID of the report to generate a PDF for
 * @param filename The name to save the file as
 * @param templateId Optional template ID to use for the report
 * @param options PDF generation options
 * @returns Promise that resolves when the download is initiated
 */
export async function generateAndDownloadPdf(
  reportId: string,
  filename: string,
  templateId?: string,
  options?: PDFGenerationOptions,
  templateContent?: string
): Promise<void> {
  try {
    const downloadUrl = await generatePdfReport(reportId, templateId, options, templateContent);
    
    if (downloadUrl) {
      downloadPdf(downloadUrl, filename);
      toast.success("Your report is ready!");
    }
  } catch (error) {
    toast.error("Failed to download PDF");
    console.error("PDF download error:", error);
  }
}

/**
 * Batch generate multiple PDFs and provide download links
 * @param reportIds Array of report IDs to generate PDFs for
 * @param templateId Optional template ID to use for all reports
 * @param options PDF generation options
 * @returns Promise resolving to an array of download URLs
 */
export async function batchGeneratePdfReports(
  reportIds: string[],
  templateId?: string,
  options?: PDFGenerationOptions
): Promise<{ reportId: string, downloadUrl: string }[]> {
  let templateContent: string | undefined;
  
  // If using a custom template, fetch it once to reuse for all reports
  if (templateId) {
    try {
      const { data, error } = await supabase
        .from("report_templates")
        .select("html_content")
        .eq("id", templateId)
        .single();
      
      if (!error && data) {
        templateContent = data.html_content;
      } else {
        console.warn("Failed to fetch template content, using default templates:", error);
      }
    } catch (err) {
      console.error("Error fetching template content:", err);
    }
  }
  try {
    toast.loading(`Generating ${reportIds.length} PDF reports...`);
    
    const results = await Promise.all(
      reportIds.map(async (reportId) => {
        try {
          const downloadUrl = await generatePdfReport(reportId, templateId, options, templateContent);
          return { reportId, downloadUrl: downloadUrl || "" };
        } catch (error) {
          console.error(`Error generating PDF for report ${reportId}:`, error);
          return { reportId, downloadUrl: "" };
        }
      })
    );
    
    const successCount = results.filter(r => r.downloadUrl).length;
    if (successCount === reportIds.length) {
      toast.success(`All ${successCount} PDFs generated successfully!`);
    } else {
      toast.success(`Generated ${successCount} out of ${reportIds.length} PDFs`);
    }
    
    return results.filter(r => r.downloadUrl);
  } catch (error) {
    toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    console.error("Batch PDF generation error:", error);
    return [];
  }
}

/**
 * Check if a PDF already exists for a report
 * @param reportId The ID of the report to check
 * @returns Promise resolving to the PDF details if found, null otherwise
 */
/**
 * Fetch available templates for a report type
 * @param reportType The type of report (western, vedic, etc.)
 * @param includeAll Whether to include all templates or just those available to the user
 * @returns Promise resolving to an array of templates
 */
export async function getAvailableTemplates(
  reportType: string,
  includeAll: boolean = false
): Promise<ReportTemplate[]> {
  try {
    let query = supabase
      .from("report_templates")
      .select("*")
      .eq("report_type", reportType)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    
    // If not including all, filter out premium templates unless the user has access
    if (!includeAll) {
      const { data: userData } = await supabase.auth.getUser();
      const { data: subscriptionData } = await supabase
        .from("user_subscriptions")
        .select("tier")
        .eq("user_id", userData.user?.id)
        .is("cancelled_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const isPremium = subscriptionData && subscriptionData.tier > 0;
      
      if (!isPremium) {
        query = query.eq("is_premium", false);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception fetching templates:", error);
    return [];
  }
}

export async function checkExistingPdf(reportId: string, templateId?: string): Promise<{ url: string, path: string } | null> {
  // If templateId is provided, we look for a specific PDF generated with that template
  // If not, we just get the most recent PDF for the report
  try {
    let query = supabase
      .from("report_pdfs")
      .select("file_path")
      .eq("report_id", reportId);
    
    // If templateId is provided, filter for PDFs created with that template
    if (templateId) {
      query = query.eq("template_id", templateId);
    }
    
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) {
      return null;
    }
    
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from("report-pdfs")
      .createSignedUrl(data.file_path, 60 * 60); // 1 hour expiry
      
    if (urlError || !urlData?.signedUrl) {
      return null;
    }
    
    return {
      url: urlData.signedUrl,
      path: data.file_path
    };
  } catch (error) {
    console.error("Error checking existing PDF:", error);
    return null;
  }
}

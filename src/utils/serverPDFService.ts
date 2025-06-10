/**
 * Professional PDF Report Generation Service
 * 
 * This module provides PDF generation functionality with server-side and client-side options:
 * - Primary: Server-side rendering via Supabase Edge Function with Puppeteer
 * - Fallback: Client-side rendering using html2pdf.js for compatibility
 * 
 * Compatible with all browsers including Safari and mobile devices.
 */
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

// Initialize Supabase client (using environment variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Report generation options
export interface ReportGenerationOptions {
  reportId: string;
  chartSvg?: string;
  reportTitle?: string;
  htmlContent?: string;
  reportData?: any;
  isPremium?: boolean;
  userData?: {
    name?: string;
    email?: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
  };
  paperSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  quality?: 'standard' | 'high' | 'premium';
  watermark?: boolean | string;
}

/**
 * Generate a PDF report via the server-side Puppeteer service
 * 
 * @param options - Configuration options for the report
 * @returns Promise with the download URL for the generated PDF
 */
export async function generateProfessionalReport(
  options: ReportGenerationOptions
): Promise<string> {
  try {
    // Show loading toast
    const toastId = toast.loading('Preparing your professional report...');
    
    // Base CSS styles for the PDF
    const baseStyles = `
      /* Base styles for print optimization */
      body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.5;
        color: #333;
        background: white;
        margin: 0;
        padding: 15px;
      }
      
      /* Print optimization styles */
      @page {
        size: ${options.paperSize || 'a4'} ${options.orientation || 'portrait'};
        margin: 15mm 10mm 15mm 10mm;
      }
      
      /* Ensure page breaks don't happen in the middle of important elements */
      h1, h2, h3, table {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      /* Chart container specific styles */
      .chart-container {
        text-align: center;
        margin: 20px auto;
        page-break-inside: avoid;
      }
      
      /* Mobile and print friendly styles */
      .page-header {
        text-align: center;
        font-size: 9pt;
        color: #666;
        position: running(header);
      }
      
      .page-footer {
        text-align: center;
        font-size: 9pt;
        color: #666;
        position: running(footer);
      }
      
      /* Report specific styles */
      .report-container {
        max-width: 100%;
        margin: 0 auto;
      }
      
      .report-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      
      .report-subtitle {
        font-size: 18px;
        text-align: center;
        margin-bottom: 30px;
        color: #555;
      }
      
      .report-section {
        margin-bottom: 25px;
      }
      
      .report-section-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }
      
      ${options.watermark ? `
      /* Watermark for non-premium reports */
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 6em;
        opacity: 0.07;
        color: #000;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      }
      ` : ''}
      
      @page {
        @top-center { content: element(header) }
        @bottom-center { content: "Page " counter(page) " of " counter(pages) }
      }
    `;
    
    // Add debug logging for content verification
    console.log('HTML Content Length:', options.htmlContent?.length || 0);
    console.log('Chart SVG Present:', !!options.chartSvg);
    
    // Ensure chart SVG is properly embedded if available
    let embeddedChartSvg = '';
    if (options.chartSvg) {
      embeddedChartSvg = `
        <div class="chart-container" style="text-align: center; margin: 20px auto; page-break-inside: avoid;">
          ${options.chartSvg}
        </div>
      `;
    }
    
    // Prepare the complete HTML document with improved structure and debug info
    const fullHtmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.reportTitle || 'Astrological Report'}</title>
        <style>
          ${baseStyles}
        </style>
      </head>
      <body>
        ${options.watermark ? `<div class="watermark">${typeof options.watermark === 'string' ? options.watermark : 'SAMPLE REPORT'}</div>` : ''}
        
        <div class="page-header">${options.reportTitle || 'Astrological Report'}</div>
        
        <div class="report-container">
          <h1 style="text-align: center; margin-bottom: 1em;">${options.reportTitle || 'Astrological Report'}</h1>
          
          <!-- User Info -->
          ${options.userData ? `
          <div style="margin: 20px 0; padding: 10px; border: 1px solid #eee; background: #f9f9f9;">
            <p><strong>Name:</strong> ${options.userData.name || 'Not specified'}</p>
            ${options.userData.birthDate ? `<p><strong>Birth Date:</strong> ${options.userData.birthDate}</p>` : ''}
            ${options.userData.birthTime ? `<p><strong>Birth Time:</strong> ${options.userData.birthTime}</p>` : ''}
            ${options.userData.birthLocation ? `<p><strong>Birth Location:</strong> ${options.userData.birthLocation}</p>` : ''}
          </div>
          ` : ''}
          
          <!-- Chart SVG if available -->
          ${embeddedChartSvg}
          
          <!-- Report Content -->
          ${options.htmlContent || '<p>Content was empty. This is a debug PDF.</p>'}
          
          <!-- Debug Info (hidden in production) -->
          <div style="font-size: 8px; color: #aaa; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px;">
            PDF Generated: ${new Date().toISOString()}
          </div>
        </div>
      </body>
      </html>
    `;

    // Call the server-side PDF generation service with proper payload format
    console.log('Calling server-side PDF generation service...');
    
    // Show debug toast
    toast.loading('Debug: Sending PDF request to server...', { id: 'debug-toast' });
    
    // Browser info to help with PDF generation optimizations
    const browserInfo = {
      name: navigator.userAgent.includes('Safari') ? 'Safari' : 
            navigator.userAgent.includes('Firefox') ? 'Firefox' : 
            navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown',
      version: '',
      userAgent: navigator.userAgent
    };
    
    // Create the request payload
    const payload = {
      reportId: options.reportId,
      templateContent: fullHtmlDocument, // This is what the Edge Function expects
      options: {
        format: options.paperSize || 'a4',
        landscape: options.orientation === 'landscape',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '10mm',
          bottom: '15mm',
          left: '10mm'
        },
        timeout: 60000,  // Extended timeout for complex reports
      },
      userData: options.userData || {},
      browserInfo,
      mockData: {
        title: options.reportTitle || 'Astrological Report',
        chartSvg: options.chartSvg || '',
        reportData: options.reportData || {}
      }
    };
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
      body: JSON.stringify(payload)
    });
    
    console.log('Server response:', data);
    
    if (error) {
      console.error('Edge Function error:', error);
      toast.error('Server PDF generation failed', { id: toastId });
      toast.dismiss('debug-toast');
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data || !data.signedUrl) {
      console.error('Invalid response from server:', data);
      toast.error('Invalid server response', { id: toastId });
      toast.dismiss('debug-toast');
      throw new Error('Server returned invalid response');
    }
    
    // Update toast and return the signed URL
    toast.success('Your report is ready!', { id: toastId });
    toast.dismiss('debug-toast');
    
    console.log('Report PDF generated successfully. URL:', data.signedUrl);
    return data.signedUrl;
  } catch (error) {
    console.error('Failed to generate report PDF:', error);
    throw error;
  }
}

/**
 * Client-side PDF generation fallback that uses html2pdf.js
 * This is used when the server-side PDF generation fails
 */
async function generateClientSidePDF(
  htmlContent: string,
  options: {
    title: string;
    filename?: string;
    showToast?: boolean;
  }
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting client-side PDF generation with html2pdf');
      console.log('Content length:', htmlContent.length);
      
      // Create a container for the content and inject it into the DOM
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1024px'; // Fixed width for more predictable rendering
      container.style.padding = '20px';
      container.innerHTML = htmlContent;
      document.body.appendChild(container);
      
      // Verify content was set
      console.log('Container content length:', container.innerHTML.length);
      
      // Force styles to be applied and layout to be calculated
      setTimeout(() => {
        // Set up html2pdf options
        const pdfOptions = {
          margin: [15, 15, 15, 15],
          filename: options.filename || `${options.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
      
        if (options.showToast) {
          toast.loading('Generating PDF locally... Please wait', { id: 'pdf-fallback-toast' });
        }
        
        // Generate the PDF
        html2pdf()
          .from(container)
          .set(pdfOptions)
          .outputPdf('datauristring')
          .then((pdfDataUri: string) => {
            // Clean up
            document.body.removeChild(container);
            
            if (options.showToast) {
              toast.success('PDF generated successfully!', { id: 'pdf-fallback-toast' });
            }
            
            resolve(pdfDataUri);
          })
          .catch((error: any) => {
            // Clean up
            document.body.removeChild(container);
            
            if (options.showToast) {
              toast.error('Failed to generate PDF locally', { id: 'pdf-fallback-toast' });
            }
            
            console.error('Client-side PDF generation failed:', error);
            reject(error);
          });
      }, 100); // Give browser 100ms to render the content before generating PDF
    } catch (error) {
      if (options.showToast) {
        toast.error('Failed to set up PDF generation', { id: 'pdf-fallback-toast' });
      }
      reject(error);
    }
  });
}

/**
 * Generate a PDF report from a specific chart and report data
 * This is the main entry point for PDF generation that should be called from the UI
 */
export async function generateAstrologyReport(
  reportId: string, 
  chartSvg: string,
  reportData: any, 
  isPremium = false
): Promise<string | null> {
  console.log('Starting astrology report generation...');
  
  try {
    // First try the server-side method
    const pdfUrl = await generateProfessionalReport({
      reportId,
      chartSvg,
      reportTitle: reportData.title || 'Astrology Report',
      htmlContent: reportData.content,
      reportData,
      isPremium,
      userData: {
        name: reportData.userName,
        birthDate: reportData.birthDate,
        birthTime: reportData.birthTime,
        birthLocation: reportData.birthLocation
      }
    });
    
    return pdfUrl;
  } catch (serverError) {
    console.warn('Server-side PDF generation failed, falling back to client-side:', serverError);
    toast.success('Using local PDF generation as fallback...', { duration: 3000 });
    
    // Create the full HTML document for client-side rendering
    const styles = `
      /* Base styles for print optimization */
      body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.5;
        color: #333;
        padding: 20px;
        margin: 0;
      }
      .report-container {
        max-width: 800px;
        margin: 0 auto;
      }
      .report-header {
        text-align: center;
        margin-bottom: 30px;
      }
      .report-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .chart-container {
        margin: 20px 0;
        text-align: center;
      }
      .chart-container svg {
        max-width: 100%;
        height: auto;
      }
      .report-section {
        margin-bottom: 30px;
      }
      .report-section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }
      .user-info {
        margin-bottom: 20px;
        font-size: 14px;
      }
      .user-info p {
        margin: 5px 0;
      }
      @page {
        size: A4;
        margin: 20mm;
      }
    `;
    
    const fullHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title || 'Astrological Report'}</title>
        <style>
          ${styles}
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <div class="report-title">${reportData.title || 'Astrological Report'}</div>
          </div>
          
          <div class="user-info">
            <p><strong>Name:</strong> ${reportData.userName || 'Not specified'}</p>
            <p><strong>Birth Date:</strong> ${reportData.birthDate || 'Not specified'}</p>
            <p><strong>Birth Time:</strong> ${reportData.birthTime || 'Not specified'}</p>
            <p><strong>Birth Location:</strong> ${reportData.birthLocation || 'Not specified'}</p>
          </div>
          
          ${chartSvg ? `<div class="chart-container">${chartSvg}</div>` : ''}
          
          <div class="report-content">
            ${reportData.content}
          </div>
        </div>
      </body>
      </html>
    `;
    
    try {
      // Fall back to client-side PDF generation
      const pdfDataUri = await generateClientSidePDF(fullHtmlContent, {
        title: reportData.title || 'Astrological Report',
        filename: `${reportData.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'astrology-report'}.pdf`,
        showToast: true
      });
      
      return pdfDataUri;
    } catch (clientError) {
      console.error('Both server-side and client-side PDF generation failed:', clientError);
      toast.error('Unable to generate PDF report. Please try again later.');
      return null;
    }
  }
}

import React, { useState } from "react";
import { generatePdfReport } from "../utils/serverPdfExport";
import Button from "../components/ui/Button";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

/**
 * PDF Generation Test Page
 * 
 * This page allows testing the server-side PDF generation functionality
 * across different browsers including Safari, Chrome, and mobile browsers.
 */
const PdfTestPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [browserInfo, setBrowserInfo] = useState<string>("");

  // Detect browser for testing
  React.useEffect(() => {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "";
    
    // Safari detection
    if (userAgent.match(/Safari/) && !userAgent.match(/Chrome/)) {
      browserName = "Safari";
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : "";
    } 
    // Chrome detection
    else if (userAgent.match(/Chrome/)) {
      browserName = "Chrome";
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : "";
    }
    // Firefox detection
    else if (userAgent.match(/Firefox/)) {
      browserName = "Firefox";
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : "";
    }
    
    // Mobile detection
    const isMobile = userAgent.match(/Mobile/) !== null;
    
    setBrowserInfo(`${browserName} ${browserVersion} ${isMobile ? "(Mobile)" : "(Desktop)"}`);
  }, []);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating PDF report...");
      
      // Create mock data for testing
      const mockReportData = {
        title: "Test PDF Report",
        content: `**Introduction**

This is a test report generated via server-side PDF generation.

**Cross-Browser Support**

This PDF was generated using Puppeteer in a Supabase Edge Function, providing consistent rendering across all browsers including Safari and Chrome.

**Browser Information**

This PDF was generated from: ${browserInfo}

**Conclusion**

If you're viewing this PDF, the server-side PDF generation is working correctly!`
      };
      
      const mockUserProfile = {
        display_name: "Test User",
        avatar_url: null,
        subscription_tier: "premium"
      };
      
      // Use the server-side PDF generation with mock data
      const result = await generatePdfReport(
        "test-report-id",
        "default-template",
        { 
          format: "A4",
          landscape: false,
          printBackground: true,
          preferCssPageSize: true,
          margin: {
            top: "1cm",
            right: "1cm", 
            bottom: "1cm",
            left: "1cm"
          },
          displayHeaderFooter: true,
          headerTemplate: "<div style='font-size: 10px; width: 100%; text-align: center;'>Mystic Banana Test Report</div>",
          footerTemplate: "<div style='font-size: 10px; width: 100%; text-align: center;'>Page <span class='pageNumber'></span> of <span class='totalPages'></span></div>"
        },
        null, // No template content, use default
        {
          reportData: mockReportData,
          userProfile: mockUserProfile,
          isMockReport: true
        }
      );
      
      setLastResult(result);
      
      if (result.success) {
        toast.dismiss();
        toast.success("PDF generated successfully!");
      } else {
        toast.dismiss();
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Error: ${error.message || "Failed to generate PDF"}`);
      setLastResult({
        success: false,
        error: error.message || "Failed to generate PDF"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">PDF Generation Test</h1>
      
      <div className="bg-dark-800 rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
        <p className="text-gray-300 mb-4">
          This tool tests the server-side PDF generation across different browsers.
        </p>
        <div className="bg-dark-700 p-4 rounded-lg mb-6">
          <p className="font-mono text-amber-400">Current Browser: {browserInfo}</p>
        </div>
        
        <Button 
          variant="primary"
          icon={Download}
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="w-full md:w-auto"
        >
          {isGenerating ? "Generating..." : "Generate Test PDF"}
        </Button>
      </div>
      
      {lastResult && (
        <div className={`bg-dark-800 rounded-xl p-6 shadow-lg mb-8 border-l-4 ${
          lastResult.success ? "border-green-500" : "border-red-500"
        }`}>
          <h2 className="text-xl font-semibold mb-4">
            {lastResult.success ? "PDF Generated Successfully" : "PDF Generation Failed"}
          </h2>
          
          {lastResult.success ? (
            <>
              <p className="text-gray-300 mb-4">
                Your PDF has been generated using server-side rendering and is ready to download.
              </p>
              <a 
                href={lastResult.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Download PDF
              </a>
            </>
          ) : (
            <div className="bg-red-900/30 p-4 rounded-lg">
              <p className="text-red-400 font-mono text-sm break-words">
                {lastResult.error}
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-dark-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">About Server-Side PDF Generation</h2>
        <p className="text-gray-300 mb-2">
          Our PDF generation system uses:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300">
          <li>Supabase Edge Functions with Puppeteer for server-side rendering</li>
          <li>Complete cross-browser compatibility (Safari, Chrome, Firefox, Mobile)</li>
          <li>Mock data support for testing without database dependencies</li>
          <li>Customizable templates and styling options</li>
        </ul>
        <p className="text-gray-400 text-sm italic">
          Note: This test page demonstrates the PDF generation functionality without requiring a real database entry.
        </p>
      </div>
    </div>
  );
};

export default PdfTestPage;

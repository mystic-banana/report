import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { AstrologyReport } from "../../store/astrologyStore";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FileText, X, Menu, ArrowLeft } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";

// Define interfaces for type safety
interface BirthChart {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: any; // JSONB from database
  chart_data?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  user_id?: string;
}

// Define interface for component props
interface HTMLReportViewerProps {
  report?: AstrologyReport; // The report object with id, title, content
  reportContent?: string; // Direct HTML/markdown content (optional)
  onClose?: () => void; // Optional close handler
}

const HTMLReportViewer: React.FC<HTMLReportViewerProps> = ({
  report,
  reportContent,
  onClose,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<BirthChart | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we're just displaying content directly, skip chart data fetching
    if (reportContent) {
      console.log("Using direct report content, skipping chart data fetch");
      setLoading(false);
      return;
    }
    
    // Only fetch chart data if we have a report object
    if (report?.id) {
      fetchChartData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, reportContent]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      if (!report?.id) {
        throw new Error("No report ID provided");
      }
      
      console.log(`Fetching detailed report data for report ID: ${report.id}`);
      
      // Direct query approach with simpler join that avoids column aliases
      const { data: reportData, error: reportError } = await supabase
        .from("astrology_reports")
        .select()
        .eq("id", report.id)
        .single();

      if (reportError) {
        console.error("Database error fetching report:", reportError);
        throw reportError;
      }

      if (!reportData) {
        console.error("No report found for ID:", report.id);
        throw new Error("Report data not found");
      }
      
      // Now fetch the birth chart separately
      if (reportData.birth_chart_id) {
        const { data: birthChartData, error: chartError } = await supabase
          .from("birth_charts")
          .select("*")
          .eq("id", reportData.birth_chart_id)
          .single();
          
        if (chartError) {
          console.error("Database error fetching birth chart:", chartError);
          // Don't throw here - continue with partially loaded data
          setChartData(null);
        } else if (!birthChartData) {
          console.error("No birth chart found for ID:", reportData.birth_chart_id);
          // Don't throw here - continue with partially loaded data
          setChartData(null);
        } else {
          // Process the birth chart data to ensure all fields exist
          const processedChartData: BirthChart = {
            ...birthChartData,
            // Handle JSONB birth_location safely
            birth_location: birthChartData.birth_location || {}
          };
          setChartData(processedChartData);
          
          console.log("Successfully fetched report and birth chart data:", {
            reportId: reportData.id,
            reportTitle: reportData.title,
            chartId: birthChartData.id,
            chartName: birthChartData.name,
            birthDate: birthChartData.birth_date
          });
        }
      } else {
        console.log("Report has no associated birth chart");
        setChartData(null);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast.error("Failed to load report data. Please try again.");
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Navigate back to reports page
  const handleBackClick = () => {
    navigate("/astrology/reports");
  };
  
  // Close functionality - ensure it navigates properly
  const handleClose = () => {
    if (onClose) onClose();
    else navigate("/astrology/reports");
  };
  
  /**
   * Advanced PDF generation using jsPDF and html2canvas directly
   * This approach offers better control and reliability across browsers
   */
  const handleDownloadPDF = async () => {
    if (!reportRef.current) {
      toast.error("Report content not ready. Please try again.");
      return;
    }
    
    setExportingPDF(true);
    const toastId = toast.loading("Preparing your PDF report...");
    
    try {
      // Document setup
      const filename = `${report?.title || "Astrology Report"}.pdf`.replace(/[/\\:*?"<>|]/g, "_");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // Add metadata
      pdf.setProperties({
        title: report?.title || "Astrology Report",
        subject: "Mystic Banana Astrology Report",
        author: "Mystic Banana",
        creator: "Mystic Banana Astrology App"
      });
      
      // Capture the report content
      toast.loading("Rendering report content...", { id: toastId });
      
      try {
        // Render to canvas
        const canvas = await html2canvas(reportRef.current, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // Fix any problematic elements in the clone
            const clonedReport = clonedDoc.querySelector(".report-container");
            if (clonedReport) {
              // Force absolute URLs for images
              const images = clonedReport.querySelectorAll("img");
              images.forEach((img: HTMLImageElement) => {
                if (img.src.startsWith("/")) {
                  img.src = window.location.origin + img.src;
                }
              });
            }
          }
        });
        
        toast.loading("Creating PDF document...", { id: toastId });
        
        // Calculate dimensions
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Set margins
        const margin = 10; // 10mm margin
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = (canvas.height * contentWidth) / canvas.width;
        
        // Add first page
        pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, contentHeight);
        
        // Handle multi-page content
        let heightLeft = contentHeight - (pageHeight - margin * 2);
        let position = margin;
        
        // Add additional pages if content overflows
        while (heightLeft > 0) {
          position = margin;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", margin, position - (contentHeight - heightLeft), contentWidth, contentHeight);
          heightLeft -= (pageHeight - margin * 2);
        }
        
        // Save the PDF
        pdf.save(filename);
        toast.success("PDF generated successfully!", { id: toastId });
      } catch (renderError) {
        console.error("Error rendering canvas:", renderError);
        toast.loading("Using fallback rendering method...", { id: toastId });
        
        // Fallback to simpler PDF
        const simplePdf = new jsPDF();
        simplePdf.setFontSize(16);
        simplePdf.text(report?.title || "Astrology Report", 20, 30);
        
        // Add content as text
        simplePdf.setFontSize(11);
        
        if (reportRef.current) {
          const textContent = reportRef.current.innerText;
          const lines = textContent.split("\n").filter(line => line.trim() !== "");
          
          let yPosition = 50;
          lines.slice(0, 30).forEach(line => {  // Limit number of lines
            if (yPosition > 280) {
              simplePdf.addPage();
              yPosition = 20;
            }
            simplePdf.text(line.substring(0, 80), 20, yPosition);
            yPosition += 10;
          });
        }
        
        const fallbackFilename = `${report?.title || "Astrology-Report"}-simple.pdf`.replace(/[/\\:*?"<>|]/g, "_");
        simplePdf.save(fallbackFilename);
        toast.success("Generated a simplified PDF version", { id: toastId });
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Could not generate your report. Please try again.", { id: toastId });
    } finally {
      setExportingPDF(false);
    }
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Back to reports"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold truncate">
            {report?.title || "Astrology Report"}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={exportingPDF}
              className="flex items-center"
            >
              {exportingPDF ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-1" />
                  <span>Download PDF</span>
                </>
              )}
            </Button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-14 left-0 right-0 z-10 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-4">
            <button
              onClick={handleBackClick}
              className="w-full flex items-center justify-start text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back to Reports</span>
            </button>
            <Button
              onClick={handleDownloadPDF}
              disabled={exportingPDF}
              className="w-full flex items-center justify-center"
            >
              {exportingPDF ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-1" />
                  <span>Download PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : report || reportContent ? (
          <div
            ref={reportRef}
            className="report-container mx-auto max-w-4xl bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 md:p-8"
          >
            {/* If we have chart data, display it */}
            {chartData && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Birth Chart</h2>
                {chartData?.chart_data && (
                  <div
                    className="chart-svg-container w-full max-w-md mx-auto"
                    dangerouslySetInnerHTML={{ __html: chartData.chart_data }}
                  />
                )}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <strong>Name:</strong> {chartData?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Birth Date:</strong>{" "}
                    {chartData?.birth_date ? new Date(chartData.birth_date).toLocaleDateString() : "Unknown"}
                  </p>
                  <p>
                    <strong>Birth Time:</strong> {chartData?.birth_time || "Unknown"}
                  </p>
                  <p>
                    <strong>Birth Location:</strong>{" "}
                    {chartData.city && chartData.country
                      ? `${chartData.city}, ${chartData.country}`
                      : chartData.birth_location && typeof chartData.birth_location === 'object'
                        ? `${chartData.birth_location.city || ''}, ${chartData.birth_location.country || ''}`
                        : "Location not available"}
                  </p>
                </div>
              </div>
            )}

            {/* Display report content */}
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-2xl font-bold mb-4">{report?.title || "Astrological Insights"}</h1>
              {/* Safely render the content with fallback */}
              {report?.content || reportContent ? (
                <div dangerouslySetInnerHTML={{ __html: report?.content || reportContent || "" }} />
              ) : (
                <p>No report content available.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
              No report data available
            </p>
            <Button onClick={handleBackClick}>Back to Reports</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HTMLReportViewer;

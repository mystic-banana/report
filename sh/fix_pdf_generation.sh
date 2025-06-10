#!/bin/bash

# Script to fix PDF generation issues in HTMLReportViewer.tsx
echo "Fixing PDF generation issues..."

# Create a backup of the original file
cp /Users/startupomatic/Documents/work/mystic-banana-astro/src/components/reports/HTMLReportViewer.tsx \
   /Users/startupomatic/Documents/work/mystic-banana-astro/src/components/reports/HTMLReportViewer.tsx.bak

# Simplify PDF generation using a more reliable approach
cat > /Users/startupomatic/Documents/work/mystic-banana-astro/src/components/reports/HTMLReportViewer.tsx << 'EOL'
import React, { useState, useEffect, useRef } from "react";
import { AstrologyReport } from "../../store/astrologyStore";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import ReportRenderer from "./ReportRenderer";
import { FileText, X, ChevronLeft, Menu, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HTMLReportViewerProps {
  report: AstrologyReport;
  onClose: () => void;
}

const HTMLReportViewer: React.FC<HTMLReportViewerProps> = ({
  report,
  onClose,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Get birth chart data for the report
        const { data: chartInfo, error } = await supabase
          .from("astrology_reports")
          .select(
            "*, birth_charts!inner(name, birth_date, birth_time, chart_data, birth_location)",
          )
          .eq("id", report.id)
          .single();

        if (error) throw error;

        setChartData(chartInfo.birth_charts);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [report.id]);

  // Navigate back to reports page
  const handleBackClick = () => {
    navigate("/astrology/reports");
  };

  const downloadPDF = async () => {
    try {
      setExportingPDF(true);
      
      if (!reportRef.current) {
        throw new Error('Could not find report element');
      }

      const userName = chartData?.name || "User";
      const birthDate = chartData?.birth_date ? new Date(chartData.birth_date).toLocaleDateString() : "";
      
      // Load required libraries
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Make sure all images are loaded before capturing
      const images = reportRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if an image fails to load
        });
      }));
      
      // Capture the report with styling
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#121218',
        logging: true,
        windowWidth: 1200, // Fixed width for consistency
        onclone: (clonedDoc) => {
          const element = clonedDoc.querySelector('.report-renderer');
          if (element) {
            // Force absolute positioning for all elements to ensure correct rendering
            const style = document.createElement('style');
            style.textContent = `
              .report-renderer * { page-break-inside: avoid; }
              .report-renderer img { max-width: 100%; height: auto; }
            `;
            clonedDoc.head.appendChild(style);
          }
          return Promise.resolve();
        }
      });
      
      // Add content to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add title page with dark background
      pdf.setFillColor(18, 18, 24);
      pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), 'F');
      
      // Add title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text(report.title, pdfWidth / 2, 40, { align: 'center' });
      
      // Add subtitle
      pdf.setFontSize(12);
      pdf.text(`${report.report_type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Report`, pdfWidth / 2, 50, { align: 'center' });
      
      // Add user info
      pdf.setFontSize(11);
      pdf.text(`Generated for: ${userName}`, pdfWidth / 2, 60, { align: 'center' });
      pdf.text(`Birth Date: ${birthDate}`, pdfWidth / 2, 66, { align: 'center' });
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 72, { align: 'center' });
      
      // Add premium badge if applicable
      if (report.is_premium) {
        pdf.setFillColor(90, 60, 140); // Dark purple
        pdf.roundedRect(pdfWidth / 2 - 20, 80, 40, 10, 3, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('PREMIUM', pdfWidth / 2, 86, { align: 'center' });
      }
      
      // Split into multiple pages if needed
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;
      
      // First page of content
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
      
      // Save the PDF with a clean filename
      pdf.save(`${userName.replace(/\s+/g, "_")}_${report.report_type.replace(/\s+/g, "_")}_Report.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again later.");
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark-950 text-white overflow-hidden">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="large" />
          <span className="ml-3 text-lg font-medium">Loading report...</span>
        </div>
      ) : (
        <>
          {/* Export overlay */}
          {exportingPDF && (
            <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center">
              <div className="bg-dark-800 p-6 rounded-lg shadow-lg text-center">
                <LoadingSpinner size="large" className="mx-auto" />
                <p className="mt-4 text-lg">Generating PDF...</p>
                <p className="text-sm text-gray-400 mt-2">
                  This may take a moment depending on report complexity
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="relative flex items-center justify-between p-3 bg-dark-900 border-b border-dark-700">
            <div className="flex items-center">
              <Button
                onClick={handleBackClick}
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                className="mr-3 text-white hover:bg-dark-800"
                aria-label="Go back to reports"
              />
              <h1 className="text-lg font-medium truncate mr-2">{report.title}</h1>
            </div>

            <div className="flex items-center">
              {/* Mobile menu toggle */}
              <Button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                variant="ghost"
                size="sm"
                icon={Menu}
                className="md:hidden text-white hover:bg-dark-800"
              />
              
              {/* Desktop controls */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  onClick={downloadPDF}
                  variant="outline"
                  size="sm"
                  icon={FileText}
                  disabled={exportingPDF}
                  className="text-white border-dark-700 hover:bg-dark-800"
                >
                  {exportingPDF ? "Exporting..." : "Download PDF"}
                </Button>
                <Button 
                  onClick={() => onClose()} 
                  variant="ghost" 
                  size="sm" 
                  icon={X}
                  className="text-white hover:bg-dark-800"
                  aria-label="Close report"
                >
                  Close
                </Button>
              </div>
            </div>
            
            {/* Mobile menu dropdown */}
            {showMobileMenu && (
              <div className="absolute top-14 right-2 bg-dark-900 rounded-lg shadow-lg border border-dark-800 p-2 z-50 md:hidden">
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => {
                      downloadPDF();
                      setShowMobileMenu(false);
                    }}
                    variant="ghost"
                    size="sm"
                    icon={FileText}
                    disabled={exportingPDF}
                    className="justify-start text-white hover:bg-dark-800"
                  >
                    {exportingPDF ? "Exporting..." : "Download PDF"}
                  </Button>
                  <Button 
                    onClick={() => onClose()} 
                    variant="ghost" 
                    size="sm" 
                    icon={X}
                    className="justify-start text-white hover:bg-dark-800"
                    aria-label="Close report"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </header>

          {/* Content - Enhanced for better readability */}
          <div className="flex-1 overflow-hidden">
            <div className="w-full h-full overflow-y-auto bg-dark-950" ref={reportRef}>
              <ReportRenderer
                report={report}
                chartData={chartData}
                className="h-full report-renderer px-3 sm:px-5 pt-4 pb-16"
              />
            </div>
          </div>
          
          {/* Footer */}
          <footer className="p-3 bg-dark-900 border-t border-dark-700 text-center text-xs text-gray-500">
            © 2025 Mystic Banana Astro • For entertainment purposes only
          </footer>
        </>
      )}
    </div>
  );
};

export default HTMLReportViewer;
EOL

echo "PDF generation fixed in HTMLReportViewer.tsx"

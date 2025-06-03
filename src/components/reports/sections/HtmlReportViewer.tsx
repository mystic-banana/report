import React, { useState } from "react";
import { AstrologyReport, BirthChart } from "../../../store/astrologyStore";
import { Eye, Download, X, Crown } from "lucide-react";
import Button from "../../ui/Button";
import ReportRenderer from "../ReportRenderer";

interface HtmlReportViewerProps {
  report: AstrologyReport;
  chartData: BirthChart;
  onClose: () => void;
}

const HtmlReportViewer: React.FC<HtmlReportViewerProps> = ({
  report,
  chartData,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<"modern" | "html">("modern");

  const generateLegacyHTML = () => {
    const isVedic = report.report_type.includes("vedic");
    const isPremium = report.is_premium;
    const userName = chartData?.name || "User";
    const birthDate = chartData?.birth_date
      ? new Date(chartData.birth_date).toLocaleDateString()
      : "";
    const birthLocation = chartData?.birth_location;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #e5e5e5;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #4A148C 0%, #7E57C2 100%);
            border-radius: 1rem;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .report-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .report-subtitle {
            font-size: 1.2rem;
            color: rgba(255,255,255,0.9);
            margin-bottom: 1rem;
        }
        
        .premium-badge {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #F59E0B, #D97706);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: 1rem;
        }
        
        .birth-info {
            background: rgba(45, 45, 45, 0.8);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #404040;
        }
        
        .birth-info h3 {
            color: #F59E0B;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }
        
        .birth-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .birth-detail {
            background: rgba(26, 26, 26, 0.5);
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid #F59E0B;
        }
        
        .birth-detail label {
            color: #737373;
            font-size: 0.875rem;
            display: block;
            margin-bottom: 0.25rem;
        }
        
        .birth-detail value {
            color: #e5e5e5;
            font-weight: 600;
        }
        
        .content-section {
            background: rgba(45, 45, 45, 0.8);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #404040;
        }
        
        .section-title {
            color: #F59E0B;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            border-bottom: 2px solid #F59E0B;
            padding-bottom: 0.5rem;
        }
        
        .section-icon {
            margin-right: 0.5rem;
            font-size: 1.2rem;
        }
        
        .content-text {
            color: #e5e5e5;
            line-height: 1.8;
            font-size: 1rem;
        }
        
        .content-text h1, .content-text h2, .content-text h3 {
            color: #F59E0B;
            margin: 1.5rem 0 1rem 0;
        }
        
        .content-text h1 {
            font-size: 1.8rem;
            border-bottom: 2px solid #F59E0B;
            padding-bottom: 0.5rem;
        }
        
        .content-text h2 {
            font-size: 1.4rem;
        }
        
        .content-text h3 {
            font-size: 1.2rem;
        }
        
        .content-text p {
            margin-bottom: 1rem;
        }
        
        .content-text ul, .content-text ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .content-text li {
            margin-bottom: 0.5rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            background: rgba(26, 26, 26, 0.8);
            border-radius: 1rem;
            border: 1px solid #404040;
        }
        
        .footer-logo {
            color: #F59E0B;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .footer-text {
            color: #737373;
            font-size: 0.875rem;
        }
        
        .watermark {
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.8);
            color: #737373;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            z-index: 1000;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .report-title {
                font-size: 2rem;
            }
            
            .birth-details {
                grid-template-columns: 1fr;
            }
        }
        
        @media print {
            body {
                background: white;
                color: black;
            }
            
            .watermark {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1 class="report-title">${report.title}</h1>
                <p class="report-subtitle">Generated for ${userName}</p>
                ${isPremium ? '<div class="premium-badge">👑 Premium Report</div>' : ""}
            </div>
        </div>
        
        <div class="birth-info">
            <h3>⭐ Birth Information</h3>
            <div class="birth-details">
                <div class="birth-detail">
                    <label>Name</label>
                    <value>${userName}</value>
                </div>
                <div class="birth-detail">
                    <label>Birth Date</label>
                    <value>${birthDate}</value>
                </div>
                ${
                  birthLocation
                    ? `
                <div class="birth-detail">
                    <label>Birth Location</label>
                    <value>${birthLocation.city}, ${birthLocation.country}</value>
                </div>
                `
                    : ""
                }
                <div class="birth-detail">
                    <label>Report Type</label>
                    <value>${report.report_type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</value>
                </div>
            </div>
        </div>
        
        <div class="content-section">
            <h2 class="section-title">
                <span class="section-icon">${isVedic ? "🕉️" : "⭐"}</span>
                ${isVedic ? "Vedic Astrology Analysis" : "Astrological Analysis"}
            </h2>
            <div class="content-text">
                ${formatReportContent(report.content)}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-logo">MysticBanana</div>
            <p class="footer-text">
                Generated on ${new Date().toLocaleDateString()} • Professional Astrology Reports
            </p>
        </div>
    </div>
    
    <div class="watermark">
        Generated by MysticBanana.com
    </div>
    
    <script>
        function formatReportContent(content) {
            return content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>');
        }
    </script>
</body>
</html>`;
  };

  const formatReportContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  };

  const downloadHTML = () => {
    try {
      let htmlContent = "";

      if (viewMode === "modern") {
        const reportElement = document.querySelector(".report-renderer");
        if (reportElement) {
          htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #0f0f23;
      color: #e5e5e5;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1, h2, h3 { color: #f59e0b; }
    .section { margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 1rem; }
    .grid { display: grid; gap: 1rem; }
    .text-center { text-align: center; }
    @media print { body { background: white; color: black; } }
  </style>
</head>
<body>
  <div class="container">
    ${reportElement.innerHTML}
  </div>
</body>
</html>`;
        } else {
          htmlContent = generateLegacyHTML();
        }
      } else {
        htmlContent = generateLegacyHTML();
      }

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("HTML download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {report.title}
              </h2>
              <p className="text-gray-400 text-sm">
                {report.report_type
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                Report
                {report.is_premium && (
                  <span className="ml-2 inline-flex items-center">
                    <Crown className="w-3 h-3 text-amber-400 mr-1" />
                    Premium
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() =>
                setViewMode(viewMode === "modern" ? "html" : "modern")
              }
              variant="outline"
              size="sm"
            >
              {viewMode === "modern" ? "Legacy HTML" : "Modern View"}
            </Button>
            <Button
              onClick={downloadHTML}
              variant="outline"
              size="sm"
              icon={Download}
            >
              Download HTML
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" icon={X}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "modern" ? (
            <div className="w-full h-full overflow-y-auto bg-gray-900">
              <ReportRenderer
                report={report}
                chartData={chartData}
                className="h-full report-renderer"
              />
            </div>
          ) : (
            <iframe
              srcDoc={generateLegacyHTML()}
              className="w-full h-full border-0"
              title="HTML Report Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HtmlReportViewer;

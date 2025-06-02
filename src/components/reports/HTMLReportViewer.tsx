import React, { useState, useEffect } from "react";
import { AstrologyReport } from "../../store/astrologyStore";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import { Download, Eye, X, Star, Crown, Calendar } from "lucide-react";

interface HTMLReportViewerProps {
  report: AstrologyReport;
  onClose: () => void;
}

const HTMLReportViewer: React.FC<HTMLReportViewerProps> = ({
  report,
  onClose,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const generateHTMLReport = async () => {
      setLoading(true);
      try {
        // Get birth chart data for the report
        const { data: chartInfo, error } = await supabase
          .from("astrology_reports")
          .select(
            "*, birth_charts!inner(name, birth_date, chart_data, birth_location)",
          )
          .eq("id", report.id)
          .single();

        if (error) throw error;

        setChartData(chartInfo.birth_charts);

        // Generate beautiful HTML content
        const html = generateBeautifulHTML(report, chartInfo.birth_charts);
        setHtmlContent(html);
      } catch (error) {
        console.error("Error generating HTML report:", error);
        setHtmlContent(`<div class="error">Error loading report content</div>`);
      } finally {
        setLoading(false);
      }
    };

    generateHTMLReport();
  }, [report]);

  const generateBeautifulHTML = (report: AstrologyReport, chartData: any) => {
    const isVedic = report.report_type.includes("vedic");
    const isPremium = report.is_premium;
    const userName = chartData?.name || "User";
    const birthDate = chartData?.birth_date
      ? new Date(chartData.birth_date).toLocaleDateString()
      : "";
    const birthLocation = chartData?.birth_location;

    return `
<!DOCTYPE html>
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
        
        .chart-container {
            background: rgba(45, 45, 45, 0.8);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #404040;
            text-align: center;
        }
        
        .chart-placeholder {
            width: 400px;
            height: 400px;
            margin: 0 auto;
            background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #F59E0B;
            position: relative;
            overflow: hidden;
        }
        
        .chart-placeholder::before {
            content: '☉';
            font-size: 4rem;
            color: #F59E0B;
            text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
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
        
        .vedic-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .vedic-card {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
        }
        
        .vedic-card h4 {
            color: #F59E0B;
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
        }
        
        .vedic-card p {
            color: #e5e5e5;
            font-size: 0.9rem;
            line-height: 1.6;
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
            
            .chart-placeholder {
                width: 300px;
                height: 300px;
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
        
        <div class="chart-container">
            <h3 class="section-title">
                <span class="section-icon">🌟</span>
                ${isVedic ? "Janma Kundali (Birth Chart)" : "Natal Chart"}
            </h3>
            <div class="chart-placeholder"></div>
            <p style="margin-top: 1rem; color: #737373; font-style: italic;">
                Interactive birth chart visualization
            </p>
        </div>
        
        ${isVedic ? generateVedicSections(report.content, isPremium) : generateWesternSections(report.content, isPremium)}
        
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
</body>
</html>`;
  };

  const generateVedicSections = (content: string, isPremium: boolean) => {
    const sections = content.split("**").filter((section) => section.trim());
    let html = "";

    // Parse content into sections
    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const text = sections[i + 1]?.trim();

      if (title && text) {
        const icon = getVedicSectionIcon(title);
        html += `
        <div class="content-section">
            <h3 class="section-title">
                <span class="section-icon">${icon}</span>
                ${title}
            </h3>
            <div class="content-text">
                ${formatContentText(text)}
            </div>
        </div>`;
      }
    }

    // Add Vedic-specific cards
    if (isPremium) {
      html += `
      <div class="vedic-sections">
          <div class="vedic-card">
              <h4>🌙 Nakshatra Analysis</h4>
              <p>Your birth star reveals deep insights into your spiritual nature and karmic patterns.</p>
          </div>
          <div class="vedic-card">
              <h4>⏰ Dasha Periods</h4>
              <p>Planetary periods that influence different phases of your life journey.</p>
          </div>
          <div class="vedic-card">
              <h4>🔮 Yogas & Doshas</h4>
              <p>Special planetary combinations that create unique opportunities and challenges.</p>
          </div>
          <div class="vedic-card">
              <h4>💎 Remedial Measures</h4>
              <p>Personalized spiritual practices to enhance positive planetary influences.</p>
          </div>
      </div>`;
    }

    return html;
  };

  const generateWesternSections = (content: string, isPremium: boolean) => {
    const sections = content.split("**").filter((section) => section.trim());
    let html = "";

    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const text = sections[i + 1]?.trim();

      if (title && text) {
        const icon = getWesternSectionIcon(title);
        html += `
        <div class="content-section">
            <h3 class="section-title">
                <span class="section-icon">${icon}</span>
                ${title}
            </h3>
            <div class="content-text">
                ${formatContentText(text)}
            </div>
        </div>`;
      }
    }

    return html;
  };

  const getVedicSectionIcon = (title: string) => {
    const icons = {
      Introduction: "📖",
      "Janma Kundali": "🌟",
      Bhava: "🏠",
      Graha: "🪐",
      Nakshatra: "⭐",
      Dasha: "⏰",
      Yoga: "🔮",
      Remedies: "💎",
      Conclusion: "🙏",
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (title.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return "✨";
  };

  const getWesternSectionIcon = (title: string) => {
    const icons = {
      Introduction: "📖",
      Personality: "👤",
      Strengths: "💪",
      Challenges: "🎯",
      Recommendations: "💡",
      Conclusion: "🌟",
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (title.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return "✨";
  };

  const formatContentText = (text: string) => {
    return text
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-white mt-4">
              Generating beautiful HTML report...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => {
                const blob = new Blob([htmlContent], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
                a.click();
                URL.revokeObjectURL(url);
              }}
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
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="HTML Report Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default HTMLReportViewer;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ReportRequest {
  reportId: string;
  reportData: {
    title: string;
    content: string;
    reportType: string;
    userName: string;
    birthDate?: string;
    chartData?: any;
    isPremium: boolean;
    birthLocation?: {
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    };
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reportData }: ReportRequest = await req.json();

    const htmlContent = generateEnhancedHTMLReport(reportData);

    return new Response(
      JSON.stringify({
        success: true,
        htmlContent,
        message: "HTML report generated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("HTML Report Generation Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate HTML report",
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

function generateEnhancedHTMLReport(reportData: any): string {
  const {
    title,
    content,
    reportType,
    userName,
    birthDate,
    isPremium,
    birthLocation,
  } = reportData;
  const isVedic = reportType.includes("vedic");
  const isTransit = reportType.includes("transit");
  const isCompatibility = reportType.includes("compatibility");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
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
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #4A148C 0%, #7E57C2 50%, #9C27B0 100%);
            border-radius: 1.5rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(74, 20, 140, 0.3);
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%);
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .cosmic-symbol {
            font-size: 4rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 30px rgba(255,255,255,0.5);
            animation: glow 3s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 30px rgba(255,255,255,0.5); }
            to { text-shadow: 0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(126, 87, 194, 0.6); }
        }
        
        .report-title {
            font-size: 3rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .report-subtitle {
            font-size: 1.3rem;
            color: rgba(255,255,255,0.9);
            margin-bottom: 1rem;
        }
        
        .premium-badge {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #F59E0B, #D97706);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1rem;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }
        
        .birth-info {
            background: linear-gradient(135deg, rgba(45, 45, 45, 0.9), rgba(26, 26, 26, 0.9));
            border-radius: 1.5rem;
            padding: 2.5rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(126, 87, 194, 0.3);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        
        .birth-info h3 {
            color: #7E57C2;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .birth-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        
        .birth-detail {
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(45, 45, 45, 0.4));
            padding: 1.5rem;
            border-radius: 1rem;
            border-left: 4px solid #7E57C2;
            transition: transform 0.2s ease;
        }
        
        .birth-detail:hover {
            transform: translateY(-2px);
        }
        
        .birth-detail label {
            color: #9CA3AF;
            font-size: 0.9rem;
            display: block;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .birth-detail value {
            color: #e5e5e5;
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .chart-container {
            background: linear-gradient(135deg, rgba(45, 45, 45, 0.9), rgba(26, 26, 26, 0.9));
            border-radius: 1.5rem;
            padding: 3rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(126, 87, 194, 0.3);
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        
        .chart-placeholder {
            width: 500px;
            height: 500px;
            margin: 0 auto;
            background: radial-gradient(circle, #2d2d2d 0%, #1a1a1a 70%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid #7E57C2;
            position: relative;
            overflow: hidden;
            box-shadow: 
                0 0 50px rgba(126, 87, 194, 0.4), 
                inset 0 0 50px rgba(126, 87, 194, 0.1);
        }
        
        .chart-placeholder::before {
            content: '${getChartSymbol(reportType)}';
            font-size: 6rem;
            color: #7E57C2;
            text-shadow: 0 0 30px rgba(126, 87, 194, 0.8);
            animation: chartGlow 3s ease-in-out infinite alternate;
        }
        
        @keyframes chartGlow {
            from { text-shadow: 0 0 30px rgba(126, 87, 194, 0.8); }
            to { text-shadow: 0 0 40px rgba(126, 87, 194, 1), 0 0 60px rgba(126, 87, 194, 0.6); }
        }
        
        .content-section {
            background: linear-gradient(135deg, rgba(45, 45, 45, 0.9), rgba(26, 26, 26, 0.9));
            border-radius: 1.5rem;
            padding: 2.5rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(126, 87, 194, 0.3);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            transition: transform 0.2s ease;
        }
        
        .content-section:hover {
            transform: translateY(-2px);
        }
        
        .section-title {
            color: #7E57C2;
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            border-bottom: 3px solid #7E57C2;
            padding-bottom: 0.75rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .section-icon {
            margin-right: 0.75rem;
            font-size: 1.5rem;
            filter: drop-shadow(0 0 10px rgba(126, 87, 194, 0.5));
        }
        
        .content-text {
            color: #e5e5e5;
            line-height: 1.8;
            font-size: 1.1rem;
        }
        
        .content-text h1, .content-text h2, .content-text h3 {
            color: #7E57C2;
            margin: 2rem 0 1rem 0;
        }
        
        .content-text h1 {
            font-size: 2rem;
            border-bottom: 2px solid #7E57C2;
            padding-bottom: 0.5rem;
        }
        
        .content-text h2 {
            font-size: 1.6rem;
        }
        
        .content-text h3 {
            font-size: 1.3rem;
        }
        
        .content-text p {
            margin-bottom: 1.2rem;
        }
        
        .content-text ul, .content-text ol {
            margin-left: 2rem;
            margin-bottom: 1.2rem;
        }
        
        .content-text li {
            margin-bottom: 0.6rem;
        }
        
        .vedic-sections, .compatibility-sections, .transit-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature-card {
            background: linear-gradient(135deg, rgba(126, 87, 194, 0.15), rgba(74, 20, 140, 0.1));
            border: 2px solid rgba(126, 87, 194, 0.3);
            border-radius: 1.5rem;
            padding: 2rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at top right, rgba(126, 87, 194, 0.1), transparent 50%);
            pointer-events: none;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(126, 87, 194, 0.2);
            border-color: rgba(126, 87, 194, 0.5);
        }
        
        .feature-card h4 {
            color: #7E57C2;
            font-size: 1.3rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
        }
        
        .feature-card p {
            color: #e5e5e5;
            font-size: 1rem;
            line-height: 1.7;
            position: relative;
            z-index: 1;
        }
        
        .footer {
            text-align: center;
            margin-top: 4rem;
            padding: 3rem;
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(45, 45, 45, 0.9));
            border-radius: 1.5rem;
            border: 1px solid rgba(126, 87, 194, 0.3);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        
        .footer-logo {
            color: #7E57C2;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .footer-text {
            color: #9CA3AF;
            font-size: 0.875rem;
        }
        
        .watermark {
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.8);
            color: #9CA3AF;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            z-index: 1000;
        }
        
        .upgrade-prompt {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
            border: 2px solid rgba(245, 158, 11, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }
        
        .upgrade-prompt h4 {
            color: #F59E0B;
            margin-bottom: 0.5rem;
        }
        
        .upgrade-prompt p {
            color: #e5e5e5;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .report-title {
                font-size: 2rem;
            }
            
            .chart-placeholder {
                width: 350px;
                height: 350px;
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
                <div class="cosmic-symbol">${getHeaderSymbol(reportType)}</div>
                <h1 class="report-title">${title}</h1>
                <p class="report-subtitle">Generated for ${userName}</p>
                ${isPremium ? '<div class="premium-badge">👑 Premium Report</div>' : ""}
            </div>
        </div>
        
        <div class="birth-info">
            <h3>⭐ ${isCompatibility ? "Relationship" : "Birth"} Information</h3>
            <div class="birth-details">
                <div class="birth-detail">
                    <label>Name</label>
                    <value>${userName}</value>
                </div>
                ${
                  birthDate
                    ? `
                <div class="birth-detail">
                    <label>Birth Date</label>
                    <value>${new Date(birthDate).toLocaleDateString()}</value>
                </div>
                `
                    : ""
                }
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
                    <value>${reportType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</value>
                </div>
                <div class="birth-detail">
                    <label>Generated</label>
                    <value>${new Date().toLocaleDateString()}</value>
                </div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3 class="section-title">
                <span class="section-icon">🌟</span>
                ${getChartTitle(reportType)}
            </h3>
            <div class="chart-placeholder"></div>
            <p style="margin-top: 1rem; color: #9CA3AF; font-style: italic;">
                ${getChartDescription(reportType)}
            </p>
        </div>
        
        ${generateSpecializedSections(reportType, isPremium)}
        
        ${generateContentSections(content, reportType, isPremium)}
        
        ${!isPremium ? generateUpgradePrompt(reportType) : ""}
        
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
}

function getChartSymbol(reportType: string): string {
  if (reportType.includes("vedic")) return "🕉️";
  if (reportType.includes("compatibility")) return "💕";
  if (reportType.includes("transit")) return "🌙";
  return "☉";
}

function getHeaderSymbol(reportType: string): string {
  if (reportType.includes("vedic")) return "🕉️";
  if (reportType.includes("compatibility")) return "💕";
  if (reportType.includes("transit")) return "🌙";
  return "✨";
}

function getChartTitle(reportType: string): string {
  if (reportType.includes("vedic")) return "Janma Kundali (Vedic Birth Chart)";
  if (reportType.includes("compatibility")) return "Synastry Chart Analysis";
  if (reportType.includes("transit")) return "Current Planetary Transits";
  return "Natal Chart Visualization";
}

function getChartDescription(reportType: string): string {
  if (reportType.includes("vedic"))
    return "Ancient Vedic astrology chart showing your karmic blueprint";
  if (reportType.includes("compatibility"))
    return "Relationship dynamics and cosmic connections";
  if (reportType.includes("transit"))
    return "Current planetary movements affecting your chart";
  return "Interactive birth chart showing planetary positions at birth";
}

function generateSpecializedSections(
  reportType: string,
  isPremium: boolean,
): string {
  if (reportType.includes("vedic")) {
    return `
    <div class="vedic-sections">
        <div class="feature-card">
            <h4>🌙 Nakshatra Analysis</h4>
            <p>Your birth star reveals deep insights into your spiritual nature and karmic patterns that guide your soul's journey.</p>
        </div>
        <div class="feature-card">
            <h4>⏰ Dasha Periods</h4>
            <p>Planetary periods that influence different phases of your life journey and timing of major events.</p>
        </div>
        <div class="feature-card">
            <h4>🏠 Bhava Analysis</h4>
            <p>Detailed house analysis showing how different life areas are influenced by planetary placements.</p>
        </div>
        ${
          isPremium
            ? `
        <div class="feature-card">
            <h4>🔮 Yogas & Doshas</h4>
            <p>Special planetary combinations that create unique opportunities and challenges in your life.</p>
        </div>
        <div class="feature-card">
            <h4>💎 Remedial Measures</h4>
            <p>Personalized spiritual practices to enhance positive planetary influences and mitigate challenges.</p>
        </div>
        <div class="feature-card">
            <h4>📊 Shadbala Strength</h4>
            <p>Detailed planetary strength analysis showing which planets are most influential in your chart.</p>
        </div>
        `
            : ""
        }
    </div>`;
  }

  if (reportType.includes("compatibility")) {
    return `
    <div class="compatibility-sections">
        <div class="feature-card">
            <h4>💕 Synastry Analysis</h4>
            <p>How your planets interact with your partner's chart to create harmony or challenges.</p>
        </div>
        <div class="feature-card">
            <h4>🔥 Elemental Harmony</h4>
            <p>Fire, Earth, Air, and Water element compatibility between your charts.</p>
        </div>
        <div class="feature-card">
            <h4>⚡ Aspect Patterns</h4>
            <p>Planetary aspects that create the foundation of your relationship dynamics.</p>
        </div>
        ${
          isPremium
            ? `
        <div class="feature-card">
            <h4>🏠 Composite Chart</h4>
            <p>The combined energy of your relationship and its potential for growth.</p>
        </div>
        <div class="feature-card">
            <h4>💫 Karmic Connections</h4>
            <p>Past-life connections and soul lessons you're meant to learn together.</p>
        </div>
        <div class="feature-card">
            <h4>🌟 Future Potential</h4>
            <p>Long-term compatibility and areas for relationship growth and development.</p>
        </div>
        `
            : ""
        }
    </div>`;
  }

  if (reportType.includes("transit")) {
    return `
    <div class="transit-sections">
        <div class="feature-card">
            <h4>🌙 Current Transits</h4>
            <p>Active planetary movements and their immediate effects on your life areas.</p>
        </div>
        <div class="feature-card">
            <h4>📅 Transit Calendar</h4>
            <p>Timeline of significant planetary events and their potential impact on your journey.</p>
        </div>
        <div class="feature-card">
            <h4>⚡ Life Area Effects</h4>
            <p>How current transits influence career, relationships, health, and personal growth.</p>
        </div>
        ${
          isPremium
            ? `
        <div class="feature-card">
            <h4>🔮 Future Predictions</h4>
            <p>Detailed forecasts for upcoming planetary movements and their significance.</p>
        </div>
        <div class="feature-card">
            <h4>💡 Timing Guidance</h4>
            <p>Best times for important decisions, new ventures, and major life changes.</p>
        </div>
        <div class="feature-card">
            <h4>🌟 Opportunity Windows</h4>
            <p>Specific periods when cosmic energies support your goals and aspirations.</p>
        </div>
        `
            : ""
        }
    </div>`;
  }

  return "";
}

function generateContentSections(
  content: string,
  reportType: string,
  isPremium: boolean,
): string {
  const sections = content.split("**").filter((section) => section.trim());
  let html = "";

  for (let i = 0; i < sections.length; i += 2) {
    const title = sections[i]?.trim();
    const text = sections[i + 1]?.trim();

    if (title && text) {
      const icon = getSectionIcon(title, reportType);
      let displayText = text;

      // Truncate content for free reports
      if (!isPremium && text.length > 500) {
        displayText = text.substring(0, 500) + "...";
        displayText +=
          "\n\n🔒 Upgrade to Premium for complete analysis and detailed insights.";
      }

      html += `
      <div class="content-section">
          <h3 class="section-title">
              <span class="section-icon">${icon}</span>
              ${title}
          </h3>
          <div class="content-text">
              ${formatContentText(displayText)}
          </div>
      </div>`;
    }
  }

  return html;
}

function getSectionIcon(title: string, reportType: string): string {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("introduction")) return "📖";
  if (titleLower.includes("personality")) return "👤";
  if (titleLower.includes("strength")) return "💪";
  if (titleLower.includes("challenge")) return "🎯";
  if (titleLower.includes("recommendation")) return "💡";
  if (titleLower.includes("conclusion")) return "🌟";
  if (titleLower.includes("janma") || titleLower.includes("kundali"))
    return "🕉️";
  if (titleLower.includes("nakshatra")) return "⭐";
  if (titleLower.includes("dasha")) return "⏰";
  if (titleLower.includes("yoga") || titleLower.includes("dosha")) return "🔮";
  if (titleLower.includes("remedies")) return "💎";
  if (titleLower.includes("transit")) return "🌙";
  if (titleLower.includes("compatibility")) return "💕";

  return "✨";
}

function formatContentText(text: string): string {
  return text
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

function generateUpgradePrompt(reportType: string): string {
  const features = {
    vedic:
      "detailed Dasha analysis, comprehensive Yoga interpretations, personalized remedies, and spiritual guidance",
    compatibility:
      "composite chart analysis, karmic connection insights, detailed synastry, and relationship forecasts",
    transit:
      "extended forecasts, detailed timing guidance, opportunity windows, and personalized recommendations",
    natal:
      "comprehensive personality analysis, detailed aspect interpretations, life path guidance, and yearly forecasts",
  };

  const reportFeatures = features[reportType] || features.natal;

  return `
  <div class="upgrade-prompt">
      <h4>🔒 Unlock Your Complete ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analysis</h4>
      <p>Upgrade to Premium to access ${reportFeatures}. Get the full cosmic picture with our comprehensive reports.</p>
      <p style="margin-top: 1rem; font-weight: 600; color: #7E57C2;">Visit MysticBanana.com to upgrade now!</p>
  </div>`;
}

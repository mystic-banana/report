import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BirthChartData } from "./astronomicalCalculations";

interface WatermarkOptions {
  userName: string;
  birthDate?: string;
  reportType?: string;
}

// Export the addImageWatermark function so it can be used in InteractiveChart.tsx
export const addImageWatermark = (
  canvas: HTMLCanvasElement,
  options: WatermarkOptions,
): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { userName, birthDate, reportType = "Birth Chart" } = options;

  // Add watermark text at the bottom
  ctx.save();
  ctx.fillStyle = "rgba(128, 128, 128, 0.7)";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";

  const watermarkText = `Generated for ${userName} ${birthDate ? "(" + new Date(birthDate).toLocaleDateString() + ")" : ""} at mysticbanana.com`;
  ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 20);

  // Add subtle diagonal watermark
  ctx.globalAlpha = 0.03;
  ctx.font = "40px Arial";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 4); // 45 degrees
  ctx.fillText("MYSTIC BANANA", 0, 0);
  ctx.restore();
};

interface ReportData {
  title: string;
  content: string;
  reportType: string;
  userName: string;
  birthDate?: string;
  chartData?: BirthChartData;
  isPremium: boolean;
  isVedic?: boolean;
  isNatalChart?: boolean;
  isTransitReport?: boolean;
  forecastDate?: string;
  forecastPeriod?: string;
}

interface AIGeneratedContent {
  introduction: string;
  personalityAnalysis: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  conclusion: string;
  detailedSections?: {
    career?: string;
    relationships?: string;
    spiritual?: string;
    health?: string;
  };
}

// Professional color scheme based on reference image
const COLORS = {
  primary: [51, 51, 51], // Dark gray for text
  secondary: [102, 102, 102], // Medium gray
  accent: [184, 134, 11], // Gold accent
  light: [245, 245, 245], // Light background
  white: [255, 255, 255],
  border: [220, 220, 220],
  chart: [139, 69, 19], // Brown for chart elements
};

// Typography system
const FONTS = {
  title: { size: 28, weight: "bold" },
  heading: { size: 16, weight: "bold" },
  subheading: { size: 12, weight: "bold" },
  body: { size: 10, weight: "normal" },
  caption: { size: 8, weight: "normal" },
};

// Layout constants
const LAYOUT = {
  margin: 20,
  columnGap: 10,
  sectionGap: 15,
  lineHeight: 4,
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
};

export const generateProfessionalAstrologyReport = async (
  reportData: ReportData,
): Promise<void> => {
  try {
    // Generate AI content first
    const aiContent = await generateAIContent(reportData);

    // Create PDF with professional styling
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let currentY = 0;
    const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;

    // Helper function for page breaks
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > LAYOUT.pageHeight - 40) {
        pdf.addPage();
        currentY = LAYOUT.margin;
        addHeader(pdf);
        addFooter(pdf, reportData);
      }
    };

    // Add header and footer to first page
    addHeader(pdf);
    addFooter(pdf, reportData);
    currentY = 50; // Start after header

    // Main title section
    addMainTitle(pdf, reportData, currentY);
    currentY += 40;

    // Birth data summary box
    checkPageBreak(50);
    addBirthDataSummary(pdf, reportData, currentY);
    currentY += 60;

    // Birth chart visualization (if available)
    if (reportData.chartData && reportData.isNatalChart) {
      checkPageBreak(120);
      await addBirthChartSection(pdf, reportData, currentY);
      currentY += 130;
    }

    // Planetary positions table
    if (reportData.chartData?.planets) {
      checkPageBreak(80);
      addPlanetaryPositionsTable(pdf, reportData.chartData, currentY);
      currentY += 90;
    }

    // Main content sections
    if (aiContent.introduction) {
      checkPageBreak(40);
      addContentSection(pdf, "INTRODUCTION", aiContent.introduction, currentY);
      currentY +=
        calculateTextHeight(pdf, aiContent.introduction, contentWidth) + 25;
    }

    if (aiContent.personalityAnalysis) {
      checkPageBreak(40);
      addContentSection(
        pdf,
        "PERSONALITY ANALYSIS",
        aiContent.personalityAnalysis,
        currentY,
      );
      currentY +=
        calculateTextHeight(pdf, aiContent.personalityAnalysis, contentWidth) +
        25;
    }

    // Strengths and challenges in two columns
    if (aiContent.strengths?.length || aiContent.challenges?.length) {
      checkPageBreak(60);
      addTwoColumnSection(
        pdf,
        "STRENGTHS & CHALLENGES",
        aiContent.strengths || [],
        aiContent.challenges || [],
        currentY,
      );
      currentY += 70;
    }

    // Aspects table (for natal charts)
    if (reportData.chartData?.aspects && reportData.isNatalChart) {
      checkPageBreak(80);
      addAspectsTable(pdf, reportData.chartData.aspects, currentY);
      currentY += 90;
    }

    // Elemental distribution chart
    if (reportData.chartData?.elementalBalance) {
      checkPageBreak(60);
      addElementalDistribution(
        pdf,
        reportData.chartData.elementalBalance,
        currentY,
      );
      currentY += 70;
    }

    // Recommendations
    if (aiContent.recommendations?.length) {
      checkPageBreak(50);
      addRecommendationsSection(pdf, aiContent.recommendations, currentY);
      currentY += 60;
    }

    // Conclusion
    if (aiContent.conclusion) {
      checkPageBreak(40);
      addContentSection(pdf, "CONCLUSION", aiContent.conclusion, currentY);
    }

    // Add watermarks to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, {
        userName: reportData.userName,
        birthDate: reportData.birthDate,
        reportType: reportData.reportType,
      });
    }

    // Generate filename and save
    const cleanName = reportData.userName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const filename = `${cleanName}_${reportData.reportType}_report_${date}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

// Header with professional branding
const addHeader = (pdf: jsPDF) => {
  // Header background
  pdf.setFillColor(...COLORS.white);
  pdf.rect(0, 0, LAYOUT.pageWidth, 35, "F");

  // Site branding
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("MYSTICBANANA.COM", LAYOUT.margin, 15);

  // Divider line
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(LAYOUT.margin, 25, LAYOUT.pageWidth - LAYOUT.margin, 25);
};

// Footer with page numbers
const addFooter = (pdf: jsPDF, reportData: ReportData) => {
  const pageNum = pdf.getCurrentPageInfo().pageNumber;

  // Footer line
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(
    LAYOUT.margin,
    LAYOUT.pageHeight - 25,
    LAYOUT.pageWidth - LAYOUT.margin,
    LAYOUT.pageHeight - 25,
  );

  // Footer text
  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(FONTS.caption.size);
  pdf.text(
    `Created for ${reportData.userName} on ${new Date().toLocaleDateString()}`,
    LAYOUT.margin,
    LAYOUT.pageHeight - 15,
  );
  pdf.text(
    `Page ${pageNum}`,
    LAYOUT.pageWidth - LAYOUT.margin - 15,
    LAYOUT.pageHeight - 15,
  );
};

// Main title section
const addMainTitle = (pdf: jsPDF, reportData: ReportData, y: number) => {
  // Main title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.title.size);
  pdf.setFont("helvetica", FONTS.title.weight);

  const titleText =
    reportData.reportType === "vedic"
      ? "VEDIC ASTROLOGY REPORT"
      : "NATAL CHART REPORT";
  const titleWidth = pdf.getTextWidth(titleText);
  pdf.text(titleText, (LAYOUT.pageWidth - titleWidth) / 2, y);

  // Subtitle
  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "italic");
  const subtitle = "Professional Astrological Analysis";
  const subtitleWidth = pdf.getTextWidth(subtitle);
  pdf.text(subtitle, (LAYOUT.pageWidth - subtitleWidth) / 2, y + 8);
};

// Birth data summary box
const addBirthDataSummary = (pdf: jsPDF, reportData: ReportData, y: number) => {
  const boxHeight = 45;
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;

  // Background box
  pdf.setFillColor(...COLORS.light);
  pdf.roundedRect(LAYOUT.margin, y, contentWidth, boxHeight, 2, 2, "F");

  // Border
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(LAYOUT.margin, y, contentWidth, boxHeight, 2, 2, "S");

  // Summary header
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", FONTS.subheading.weight);
  pdf.text("SUMMARY", LAYOUT.margin + 10, y + 12);

  // Three column layout for birth data
  const colWidth = (contentWidth - 40) / 3;

  // Column 1: Sun, Moon, Rising
  pdf.setFontSize(FONTS.caption.size);
  pdf.setFont("helvetica", "bold");
  pdf.text("Sun", LAYOUT.margin + 10, y + 22);
  pdf.text("Moon", LAYOUT.margin + 10, y + 30);
  pdf.text("Rising", LAYOUT.margin + 10, y + 38);

  pdf.setFont("helvetica", "normal");
  const sunSign =
    reportData.chartData?.planets?.find((p) => p.name === "Sun")?.sign ||
    "Libra";
  const moonSign =
    reportData.chartData?.planets?.find((p) => p.name === "Moon")?.sign ||
    "Taurus";
  const risingSign =
    reportData.chartData?.planets?.find((p) => p.name === "Ascendant")?.sign ||
    "Virgo";

  pdf.text(sunSign, LAYOUT.margin + 35, y + 22);
  pdf.text(moonSign, LAYOUT.margin + 35, y + 30);
  pdf.text(risingSign, LAYOUT.margin + 35, y + 38);

  // Column 2: Birth data
  const col2X = LAYOUT.margin + colWidth + 20;
  pdf.setFont("helvetica", "bold");
  pdf.text("Birth data", col2X, y + 22);

  pdf.setFont("helvetica", "normal");
  if (reportData.birthDate) {
    const birthDate = new Date(reportData.birthDate);
    pdf.text(`${birthDate.toLocaleDateString()}`, col2X, y + 30);
  }

  // Column 3: Modalities chart (simplified)
  const col3X = LAYOUT.margin + colWidth * 2 + 30;
  pdf.setFont("helvetica", "bold");
  pdf.text("Modalities", col3X, y + 22);

  // Simple modality bars
  pdf.setFillColor(139, 69, 19); // Brown color
  pdf.rect(col3X, y + 25, 30, 3, "F"); // Cardinal
  pdf.rect(col3X, y + 30, 25, 3, "F"); // Fixed
  pdf.rect(col3X, y + 35, 20, 3, "F"); // Mutable

  pdf.setFontSize(6);
  pdf.setFont("helvetica", "normal");
  pdf.text("Cardinal", col3X + 35, y + 27);
  pdf.text("Fixed", col3X + 35, y + 32);
  pdf.text("Mutable", col3X + 35, y + 37);
};

// Birth chart section with visualization
const addBirthChartSection = async (
  pdf: jsPDF,
  reportData: ReportData,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("BIRTH CHART", LAYOUT.margin, y);

  // Generate and add chart image
  try {
    const chartImageData = await generateBirthChartImage(
      reportData.chartData!,
      reportData.isPremium,
    );
    if (chartImageData) {
      const chartSize = 80;
      const chartX = (LAYOUT.pageWidth - chartSize) / 2;
      pdf.addImage(chartImageData, "PNG", chartX, y + 10, chartSize, chartSize);
    }
  } catch (error) {
    console.warn("Failed to generate chart image:", error);
    // Add placeholder
    pdf.setTextColor(...COLORS.secondary);
    pdf.setFontSize(FONTS.body.size);
    pdf.text("Birth chart visualization", LAYOUT.pageWidth / 2 - 30, y + 50);
  }
};

// Planetary positions table
const addPlanetaryPositionsTable = (
  pdf: jsPDF,
  chartData: BirthChartData,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("PLANETARY POSITIONS", LAYOUT.margin, y);

  const tableY = y + 15;
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;
  const colWidths = [40, 30, 25, 25, 25, 25];
  const headers = ["Planet", "Data", "House", "Aspect", "°", "'"];

  // Table header
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(LAYOUT.margin, tableY, contentWidth, 8, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(FONTS.caption.size);
  pdf.setFont("helvetica", "bold");

  let xPos = LAYOUT.margin + 2;
  headers.forEach((header, index) => {
    pdf.text(header, xPos, tableY + 5);
    xPos += colWidths[index];
  });

  // Table rows
  pdf.setTextColor(...COLORS.primary);
  pdf.setFont("helvetica", "normal");

  const majorPlanets = chartData.planets.slice(0, 10);
  majorPlanets.forEach((planet, index) => {
    const rowY = tableY + 8 + index * 6;

    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.light);
      pdf.rect(LAYOUT.margin, rowY, contentWidth, 6, "F");
    }

    xPos = LAYOUT.margin + 2;
    const rowData = [
      planet.name,
      planet.sign,
      planet.house?.toString() || "—",
      "○", // Simplified aspect symbol
      planet.degree.toString(),
      planet.minute?.toString() || "0",
    ];

    rowData.forEach((data, colIndex) => {
      pdf.text(data, xPos, rowY + 4);
      xPos += colWidths[colIndex];
    });
  });
};

// Content section with professional formatting
const addContentSection = (
  pdf: jsPDF,
  title: string,
  content: string,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text(title, LAYOUT.margin, y);

  // Content
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");

  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;
  const lines = pdf.splitTextToSize(content, contentWidth);
  pdf.text(lines, LAYOUT.margin, y + 10);
};

// Two column section for strengths and challenges
const addTwoColumnSection = (
  pdf: jsPDF,
  title: string,
  strengths: string[],
  challenges: string[],
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text(title, LAYOUT.margin, y);

  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;
  const colWidth = (contentWidth - LAYOUT.columnGap) / 2;

  // Left column - Strengths
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", "bold");
  pdf.text("Strengths", LAYOUT.margin, y + 15);

  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");
  let leftY = y + 22;

  strengths.slice(0, 4).forEach((strength) => {
    pdf.text("•", LAYOUT.margin, leftY);
    const lines = pdf.splitTextToSize(strength, colWidth - 10);
    pdf.text(lines, LAYOUT.margin + 5, leftY);
    leftY += lines.length * 4 + 2;
  });

  // Right column - Challenges
  const rightX = LAYOUT.margin + colWidth + LAYOUT.columnGap;
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", "bold");
  pdf.text("Areas for Growth", rightX, y + 15);

  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");
  let rightY = y + 22;

  challenges.slice(0, 4).forEach((challenge) => {
    pdf.text("•", rightX, rightY);
    const lines = pdf.splitTextToSize(challenge, colWidth - 10);
    pdf.text(lines, rightX + 5, rightY);
    rightY += lines.length * 4 + 2;
  });
};

// Aspects table
const addAspectsTable = (pdf: jsPDF, aspects: any[], y: number) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("ASPECTS", LAYOUT.margin, y);

  const tableY = y + 15;
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;
  const colWidths = [60, 40, 30, 40];
  const headers = ["Conjunction", "Sextile", "Trine", "Opposition"];

  // Simplified aspects display
  pdf.setFillColor(...COLORS.light);
  pdf.rect(LAYOUT.margin, tableY, contentWidth, 25, "F");

  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");

  let xPos = LAYOUT.margin + 5;
  headers.forEach((header, index) => {
    pdf.text(header, xPos, tableY + 8);
    // Add aspect symbols or counts
    pdf.text("✓", xPos, tableY + 15);
    xPos += colWidths[index];
  });
};

// Elemental distribution
const addElementalDistribution = (
  pdf: jsPDF,
  elementalBalance: any,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("DISTRIBUTION OF ELEMENTS", LAYOUT.margin, y);

  const chartY = y + 15;
  const elements = ["Fire", "Earth", "Air", "Water"];
  const colors = [
    [255, 69, 0],
    [139, 69, 19],
    [135, 206, 235],
    [0, 191, 255],
  ];

  elements.forEach((element, index) => {
    const barY = chartY + index * 8;
    const barWidth = 60; // Fixed width for demo

    // Element label
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.body.size);
    pdf.text(element, LAYOUT.margin, barY + 4);

    // Progress bar background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(LAYOUT.margin + 25, barY, 80, 5, "F");

    // Progress bar fill
    pdf.setFillColor(...colors[index]);
    pdf.rect(LAYOUT.margin + 25, barY, barWidth, 5, "F");

    // Percentage
    pdf.setTextColor(...COLORS.secondary);
    pdf.setFontSize(FONTS.caption.size);
    pdf.text("75%", LAYOUT.margin + 110, barY + 4);
  });
};

// Recommendations section
const addRecommendationsSection = (
  pdf: jsPDF,
  recommendations: string[],
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("RECOMMENDATIONS", LAYOUT.margin, y);

  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");

  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;
  let currentY = y + 15;

  recommendations.slice(0, 5).forEach((rec, index) => {
    // Number circle
    pdf.setFillColor(...COLORS.accent);
    pdf.circle(LAYOUT.margin + 5, currentY + 2, 3, "F");

    pdf.setTextColor(...COLORS.white);
    pdf.setFontSize(FONTS.caption.size);
    pdf.setFont("helvetica", "bold");
    pdf.text((index + 1).toString(), LAYOUT.margin + 3, currentY + 3);

    // Recommendation text
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont("helvetica", "normal");

    const lines = pdf.splitTextToSize(rec, contentWidth - 15);
    pdf.text(lines, LAYOUT.margin + 12, currentY + 3);
    currentY += lines.length * 4 + 5;
  });
};

// Generate birth chart image
const generateBirthChartImage = async (
  chartData: BirthChartData,
  isPremium: boolean = false,
): Promise<string | null> => {
  try {
    const canvas = document.createElement("canvas");
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 30;

    // Outer circle
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner circle
    ctx.strokeStyle = "#D2B48C";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
    ctx.stroke();

    // Zodiac signs
    const zodiacSymbols = {
      Aries: "♈",
      Taurus: "♉",
      Gemini: "♊",
      Cancer: "♋",
      Leo: "♌",
      Virgo: "♍",
      Libra: "♎",
      Scorpio: "♏",
      Sagittarius: "♐",
      Capricorn: "♑",
      Aquarius: "♒",
      Pisces: "♓",
    };

    ctx.fillStyle = "#8B4513";
    ctx.font = "14px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    Object.entries(zodiacSymbols).forEach(([sign, symbol], index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * (radius * 0.85);
      const y = centerY + Math.sin(angle) * (radius * 0.85);
      ctx.fillText(symbol, x, y);
    });

    // Planets
    const planetSymbols = {
      Sun: "☉",
      Moon: "☽",
      Mercury: "☿",
      Venus: "♀",
      Mars: "♂",
      Jupiter: "♃",
      Saturn: "♄",
      Uranus: "♅",
      Neptune: "♆",
      Pluto: "♇",
    };

    chartData.planets.forEach((planet) => {
      if (planetSymbols[planet.name]) {
        const angle = (planet.longitude - 90) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * (radius * 0.9);
        const y = centerY + Math.sin(angle) * (radius * 0.9);

        // Planet circle
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#8B4513";
        ctx.stroke();

        // Planet symbol
        ctx.fillStyle = "#8B4513";
        ctx.font = "12px serif";
        ctx.fillText(planetSymbols[planet.name], x, y);
      }
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Failed to generate birth chart image:", error);
    return null;
  }
};

// Calculate text height
const calculateTextHeight = (
  pdf: jsPDF,
  text: string,
  width: number,
): number => {
  const lines = pdf.splitTextToSize(text, width);
  return lines.length * LAYOUT.lineHeight;
};

// AI Content Generation
const generateAIContent = async (
  reportData: ReportData,
): Promise<AIGeneratedContent> => {
  try {
    // Try to use OpenAI for content generation
    const OpenAI = (await import("openai")).default;
    const apiKey =
      import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = `Create a comprehensive ${reportData.reportType} astrology report for ${reportData.userName}.

Provide detailed analysis in JSON format with these sections:
- introduction: Warm, engaging introduction
- personalityAnalysis: Deep personality analysis
- strengths: Array of 5-7 key strengths
- challenges: Array of 4-6 growth areas
- recommendations: Array of 6-8 actionable recommendations
- conclusion: Inspiring conclusion

Make it professional, personalized, and ${reportData.isPremium ? "comprehensive" : "concise"}.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional astrologer creating personalized reports.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: reportData.isPremium ? 2000 : 1000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }
      }
    }
  } catch (error) {
    console.warn("AI content generation failed, using fallback:", error);
  }

  // Fallback content
  return {
    introduction: `Welcome to your personalized ${reportData.reportType} astrology report, ${reportData.userName}. This comprehensive analysis explores the cosmic influences that shape your unique personality and life path.`,
    personalityAnalysis:
      "Your astrological profile reveals a complex and fascinating personality. The planetary positions at your birth create a unique cosmic fingerprint that influences your thoughts, emotions, and actions.",
    strengths: [
      "Natural leadership abilities and charismatic presence",
      "Strong intuition and emotional intelligence",
      "Excellent communication and interpersonal skills",
      "Creative problem-solving capabilities",
      "Resilience and adaptability in challenging situations",
      "Deep empathy and understanding of others",
    ],
    challenges: [
      "Tendency to be overly critical of yourself",
      "Difficulty in making quick decisions under pressure",
      "Sometimes struggle with work-life balance",
      "May avoid confrontation even when necessary",
      "Perfectionist tendencies that can cause stress",
    ],
    recommendations: [
      "Practice daily meditation or mindfulness to center yourself",
      "Set clear boundaries between work and personal time",
      "Trust your intuition more when making important decisions",
      "Engage in creative activities that bring you joy",
      "Build a strong support network of trusted friends and mentors",
      "Focus on self-compassion and celebrate your achievements",
    ],
    conclusion:
      "Your astrological journey is unique and filled with potential. Use these insights to make conscious choices that align with your true nature and deepest aspirations.",
  };
};

// Add watermark
const addWatermark = (pdf: jsPDF, options: WatermarkOptions): void => {
  const { userName, birthDate, reportType } = options;

  let watermarkText = `Generated for ${userName}`;
  if (birthDate)
    watermarkText += ` (${new Date(birthDate).toLocaleDateString()})`;
  if (reportType) watermarkText += ` - ${reportType}`;
  watermarkText += " at mysticbanana.com";

  // Bottom watermark
  pdf.setFontSize(6);
  pdf.setTextColor(180, 180, 180);
  pdf.text(watermarkText, LAYOUT.pageWidth / 2, LAYOUT.pageHeight - 5, {
    align: "center",
  });

  // Diagonal watermark
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.03 }));
  pdf.setFontSize(40);
  pdf.setTextColor(200, 200, 200);

  pdf.text("MYSTIC BANANA", LAYOUT.pageWidth / 2, LAYOUT.pageHeight / 2, {
    align: "center",
    angle: 45,
  });
  pdf.restoreGraphicsState();
};

// Legacy function for compatibility
export const generatePDFWithWatermark = async (
  element: HTMLElement,
  filename: string,
  watermarkOptions: WatermarkOptions,
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297;

    let heightLeft = imgHeight;
    let position = 10;

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, watermarkOptions);
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

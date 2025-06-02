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
  planetaryPositions?: any[];
  aspectTable?: any[];
  elementalBalance?: any;
  modalBalance?: any;
  chartPatterns?: any[];
  retrogradeInfo?: any;
  lunarPhase?: any;
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

// Professional color scheme based on sample images - warm beige/cream theme
const COLORS = {
  primary: [101, 67, 33], // Dark brown for text
  secondary: [139, 105, 71], // Medium brown
  accent: [184, 134, 11], // Gold accent
  light: [245, 240, 235], // Warm cream background
  white: [255, 255, 255],
  border: [200, 180, 160], // Warm border
  chart: [139, 105, 71], // Brown for chart elements
  beige: [240, 235, 225], // Main beige background
  warmGray: [120, 110, 100], // Warm gray for secondary text
};

// Typography system matching samples
const FONTS = {
  title: { size: 24, weight: "bold" },
  heading: { size: 14, weight: "bold" },
  subheading: { size: 11, weight: "bold" },
  body: { size: 9, weight: "normal" },
  caption: { size: 7, weight: "normal" },
  large: { size: 16, weight: "normal" },
};

// Layout constants
const LAYOUT = {
  margin: 20,
  columnGap: 10,
  sectionGap: 12,
  lineHeight: 3.5,
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
        addHeader(pdf, reportData.isPremium);
        addFooter(pdf, reportData);
      }
    };

    // Add header and footer to first page
    addHeader(pdf, reportData.isPremium);
    addFooter(pdf, reportData);
    currentY = 40; // Start after header

    // Cover page
    addCoverPage(pdf, reportData, currentY);

    // Add new page for content
    pdf.addPage();
    addHeader(pdf, reportData.isPremium);
    addFooter(pdf, reportData);
    currentY = 50;

    // Summary section with birth chart
    checkPageBreak(120);
    await addSummarySection(pdf, reportData, currentY);
    currentY += 130;

    // Planetary positions table
    if (reportData.chartData?.planets || reportData.planetaryPositions) {
      checkPageBreak(80);
      addPlanetaryPositionsTable(pdf, reportData, currentY);
      currentY += 90;
    }

    // Planet details section
    checkPageBreak(100);
    addPlanetDetailsSection(pdf, reportData, currentY);
    currentY += 110;

    // Elemental and modal distribution
    if (reportData.chartData?.elementalBalance || reportData.elementalBalance) {
      checkPageBreak(80);
      addElementalModalSection(pdf, reportData, currentY);
      currentY += 90;
    }

    // Main content sections
    if (aiContent.introduction) {
      checkPageBreak(40);
      addContentSection(
        pdf,
        "INTRODUCTION",
        aiContent.introduction,
        currentY,
        reportData.isPremium,
      );
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
        reportData.isPremium,
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
        "STRENGTHS & AREAS FOR GROWTH",
        aiContent.strengths || [],
        aiContent.challenges || [],
        currentY,
        reportData.isPremium,
      );
      currentY += 80;
    }

    // Aspects analysis
    if (reportData.chartData?.aspects || reportData.aspectTable) {
      checkPageBreak(80);
      addAspectsSection(pdf, reportData, currentY);
      currentY += 90;
    }

    // Recommendations
    if (aiContent.recommendations?.length) {
      checkPageBreak(60);
      addRecommendationsSection(
        pdf,
        aiContent.recommendations,
        currentY,
        reportData.isPremium,
      );
      currentY += 70;
    }

    // Premium upgrade prompt for free reports
    if (!reportData.isPremium) {
      checkPageBreak(60);
      addPremiumUpgradeSection(pdf, currentY);
      currentY += 70;
    }

    // Conclusion
    if (aiContent.conclusion) {
      checkPageBreak(40);
      addContentSection(
        pdf,
        "CONCLUSION",
        aiContent.conclusion,
        currentY,
        reportData.isPremium,
      );
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
    const reportTypeText = reportData.isPremium ? "premium" : "free";
    const filename = `${cleanName}_${reportData.reportType}_${reportTypeText}_report_${date}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

// Header with report type (Free/Premium) aligned right
const addHeader = (pdf: jsPDF, isPremium: boolean) => {
  // Header background
  pdf.setFillColor(...COLORS.beige);
  pdf.rect(0, 0, LAYOUT.pageWidth, 30, "F");

  // Report type badge on the right
  const reportType = isPremium ? "PREMIUM REPORT" : "FREE REPORT";
  const badgeColor = isPremium ? COLORS.accent : COLORS.primary;

  pdf.setTextColor(...badgeColor);
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", FONTS.subheading.weight);

  const textWidth = pdf.getTextWidth(reportType);
  pdf.text(reportType, LAYOUT.pageWidth - LAYOUT.margin - textWidth, 15);

  // Divider line
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(LAYOUT.margin, 25, LAYOUT.pageWidth - LAYOUT.margin, 25);
};

// Footer with page numbers and branding
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
  pdf.setTextColor(...COLORS.warmGray);
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

// Cover page matching sample design
const addCoverPage = (pdf: jsPDF, reportData: ReportData, y: number) => {
  // Background
  pdf.setFillColor(...COLORS.beige);
  pdf.rect(0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight, "F");

  // Website branding at top
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");
  const brandText = "MYSTICBANANA.COM";
  const brandWidth = pdf.getTextWidth(brandText);
  pdf.text(brandText, (LAYOUT.pageWidth - brandWidth) / 2, 40);

  // Main title with decorative elements
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.title.size + 8);
  pdf.setFont("helvetica", FONTS.title.weight);

  const titleText =
    reportData.reportType === "vedic"
      ? "VEDIC ASTROLOGY\nREPORT"
      : "NATAL CHART\nREPORT";
  const titleLines = titleText.split("\n");
  let titleY = 80;

  titleLines.forEach((line) => {
    const lineWidth = pdf.getTextWidth(line);
    pdf.text(line, (LAYOUT.pageWidth - lineWidth) / 2, titleY);
    titleY += 12;
  });

  // Decorative sun/moon symbol
  pdf.setFontSize(40);
  pdf.setFont("helvetica", "normal");
  const symbol = "☉";
  const symbolWidth = pdf.getTextWidth(symbol);
  pdf.text(symbol, (LAYOUT.pageWidth - symbolWidth) / 2, 130);

  // User name
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.large.size + 4);
  pdf.setFont("helvetica", "normal");
  const nameWidth = pdf.getTextWidth(reportData.userName);
  pdf.text(reportData.userName, (LAYOUT.pageWidth - nameWidth) / 2, 160);

  // Birth details
  if (reportData.birthDate) {
    const birthDate = new Date(reportData.birthDate);
    const birthText = `Birth on ${birthDate.toLocaleDateString()}`;
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont("helvetica", "italic");
    const birthWidth = pdf.getTextWidth(birthText);
    pdf.text(birthText, (LAYOUT.pageWidth - birthWidth) / 2, 175);
  }

  // Creation details at bottom
  const creationText = `Created for ${reportData.userName} on ${new Date().toLocaleDateString()}`;
  const websiteText = "by MysticBanana.com";

  pdf.setFontSize(FONTS.caption.size);
  pdf.setFont("helvetica", "normal");

  const creationWidth = pdf.getTextWidth(creationText);
  const websiteWidth = pdf.getTextWidth(websiteText);

  pdf.text(creationText, (LAYOUT.pageWidth - creationWidth) / 2, 250);
  pdf.text(websiteText, (LAYOUT.pageWidth - websiteWidth) / 2, 260);
};

// Summary section with birth chart
const addSummarySection = async (
  pdf: jsPDF,
  reportData: ReportData,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("SUMMARY", LAYOUT.margin, y);

  const summaryY = y + 15;
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;

  // Three column layout for Sun, Moon, Rising
  const colWidth = contentWidth / 3;
  const signs = ["Sun", "Moon", "Rising"];
  const symbols = ["☉", "☽", "☰"];

  const sunSign =
    reportData.chartData?.planets?.find((p) => p.name === "Sun")?.sign ||
    "Libra";
  const moonSign =
    reportData.chartData?.planets?.find((p) => p.name === "Moon")?.sign ||
    "Taurus";
  const risingSign =
    reportData.chartData?.planets?.find((p) => p.name === "Ascendant")?.sign ||
    "Virgo";
  const signValues = [sunSign, moonSign, risingSign];

  // Draw boxes for Sun, Moon, Rising
  signs.forEach((sign, index) => {
    const x = LAYOUT.margin + index * colWidth;

    // Box background
    pdf.setFillColor(...COLORS.light);
    pdf.roundedRect(x + 5, summaryY, colWidth - 10, 25, 2, 2, "F");

    // Box border
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x + 5, summaryY, colWidth - 10, 25, 2, 2, "S");

    // Symbol
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "normal");
    pdf.text(symbols[index], x + 15, summaryY + 10);

    // Sign name
    pdf.setFontSize(FONTS.subheading.size);
    pdf.setFont("helvetica", FONTS.subheading.weight);
    pdf.text(sign, x + 25, summaryY + 10);

    // Sign value
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont("helvetica", "normal");
    pdf.text(signValues[index], x + 25, summaryY + 18);
  });

  // Birth chart visualization with improved size and quality
  try {
    const chartImageData = await generateEnhancedBirthChart(
      reportData.chartData!,
      reportData.isPremium,
    );
    if (chartImageData) {
      const chartSize = 120; // Increased size for better visibility
      const chartX = (LAYOUT.pageWidth - chartSize) / 2;
      pdf.addImage(
        chartImageData,
        "PNG",
        chartX,
        summaryY + 35,
        chartSize,
        chartSize,
        undefined,
        "FAST", // Better compression while maintaining quality
      );
    }
  } catch (error) {
    console.warn("Failed to generate chart image:", error);
  }
};

// Planetary positions table matching sample
const addPlanetaryPositionsTable = (
  pdf: jsPDF,
  reportData: ReportData,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("PLANETARY POSITIONS", LAYOUT.margin, y);

  const tableY = y + 15;
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;
  const colWidths = [30, 25, 30, 25, 20, 20, 20];
  const headers = ["Planet", "Data", "House", "Aspect", "°", "'", '"'];

  // Table header background
  pdf.setFillColor(...COLORS.light);
  pdf.rect(LAYOUT.margin, tableY, contentWidth, 8, "F");

  // Table header border
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.rect(LAYOUT.margin, tableY, contentWidth, 8, "S");

  // Header text
  pdf.setTextColor(...COLORS.primary);
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

  const planets =
    reportData.chartData?.planets || reportData.planetaryPositions || [];
  const majorPlanets = planets.slice(0, 10);

  majorPlanets.forEach((planet, index) => {
    const rowY = tableY + 8 + index * 6;

    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.beige);
      pdf.rect(LAYOUT.margin, rowY, contentWidth, 6, "F");
    }

    // Row border
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.2);
    pdf.rect(LAYOUT.margin, rowY, contentWidth, 6, "S");

    xPos = LAYOUT.margin + 2;
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

    const rowData = [
      planetSymbols[planet.name] || planet.name,
      planet.sign || "—",
      planet.house?.toString() || "—",
      "○", // Aspect symbol
      planet.degree?.toString() || "0",
      planet.minute?.toString() || "0",
      planet.second?.toString() || "0",
    ];

    rowData.forEach((data, colIndex) => {
      pdf.text(data, xPos, rowY + 4);
      xPos += colWidths[colIndex];
    });
  });
};

// Planet details section matching sample
const addPlanetDetailsSection = (
  pdf: jsPDF,
  reportData: ReportData,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("PLANET DETAILS", LAYOUT.margin, y);

  const detailsY = y + 15;
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;

  // Sample planet details (first 3 planets)
  const planets = reportData.chartData?.planets || [];
  const samplePlanets = planets.slice(0, 3);

  samplePlanets.forEach((planet, index) => {
    const itemY = detailsY + index * 25;

    // Planet symbol circle
    pdf.setFillColor(...COLORS.light);
    pdf.circle(LAYOUT.margin + 10, itemY + 8, 6, "F");

    pdf.setDrawColor(...COLORS.border);
    pdf.circle(LAYOUT.margin + 10, itemY + 8, 6, "S");

    // Planet symbol
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

    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.body.size);
    pdf.text(
      planetSymbols[planet.name] || planet.name.charAt(0),
      LAYOUT.margin + 8,
      itemY + 10,
    );

    // Planet name and sign
    pdf.setFontSize(FONTS.subheading.size);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${planet.name} ${planet.sign}`, LAYOUT.margin + 25, itemY + 6);

    // Description
    pdf.setFontSize(FONTS.caption.size);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLORS.warmGray);
    const description = getPlanetDescription(planet.name, planet.sign);
    const lines = pdf.splitTextToSize(description, contentWidth - 40);
    pdf.text(lines, LAYOUT.margin + 25, itemY + 12);
  });
};

// Elemental and modal distribution section
const addElementalModalSection = (
  pdf: jsPDF,
  reportData: ReportData,
  y: number,
) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("DISTRIBUTION OF ELEMENTS", LAYOUT.margin, y);

  const chartY = y + 15;
  const elements = ["Fire", "Earth", "Air", "Water"];
  const elementColors = [
    [220, 100, 50], // Fire - orange/red
    [139, 105, 71], // Earth - brown
    [100, 150, 200], // Air - light blue
    [80, 160, 180], // Water - teal
  ];

  const modalities = ["Cardinal", "Fixed", "Mutable"];
  const modalColors = [
    [200, 150, 150], // Cardinal - light red
    [180, 160, 120], // Fixed - beige
    [150, 180, 200], // Mutable - light blue
  ];

  // Elements chart
  elements.forEach((element, index) => {
    const barY = chartY + index * 12;
    const barWidth = 60; // Sample width

    // Element label
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.body.size);
    pdf.text(element, LAYOUT.margin, barY + 4);

    // Progress bar background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(LAYOUT.margin + 25, barY, 80, 6, "F");

    // Progress bar fill
    pdf.setFillColor(...elementColors[index]);
    pdf.rect(LAYOUT.margin + 25, barY, barWidth, 6, "F");

    // Percentage
    pdf.setTextColor(...COLORS.warmGray);
    pdf.setFontSize(FONTS.caption.size);
    pdf.text("75%", LAYOUT.margin + 110, barY + 4);
  });

  // Modalities chart (right side)
  const modalX = LAYOUT.margin + 120;
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", "bold");
  pdf.text("MODALITIES", modalX, chartY - 5);

  modalities.forEach((modality, index) => {
    const barY = chartY + index * 12;
    const barWidth = 50; // Sample width

    // Modality label
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.body.size);
    pdf.text(modality, modalX, barY + 4);

    // Progress bar background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(modalX + 25, barY, 60, 6, "F");

    // Progress bar fill
    pdf.setFillColor(...modalColors[index]);
    pdf.rect(modalX + 25, barY, barWidth, 6, "F");
  });
};

// Content section with premium upgrade prompts
const addContentSection = (
  pdf: jsPDF,
  title: string,
  content: string,
  y: number,
  isPremium: boolean,
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
  let displayContent = content;

  // Truncate free content and add upgrade prompt
  if (!isPremium) {
    const words = content.split(" ");
    if (words.length > 50) {
      displayContent = words.slice(0, 50).join(" ") + "...";
      displayContent +=
        "\n\n🔒 Upgrade to Premium for complete analysis and detailed insights.";
    }
  }

  const lines = pdf.splitTextToSize(displayContent, contentWidth);
  pdf.text(lines, LAYOUT.margin, y + 10);
};

// Two column section for strengths and challenges
const addTwoColumnSection = (
  pdf: jsPDF,
  title: string,
  strengths: string[],
  challenges: string[],
  y: number,
  isPremium: boolean,
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

  const displayStrengths = isPremium ? strengths : strengths.slice(0, 3);
  displayStrengths.forEach((strength) => {
    pdf.text("•", LAYOUT.margin, leftY);
    const lines = pdf.splitTextToSize(strength, colWidth - 10);
    pdf.text(lines, LAYOUT.margin + 5, leftY);
    leftY += lines.length * 4 + 2;
  });

  if (!isPremium && strengths.length > 3) {
    pdf.setTextColor(...COLORS.accent);
    pdf.setFontSize(FONTS.caption.size);
    pdf.text(
      `+${strengths.length - 3} more in Premium`,
      LAYOUT.margin,
      leftY + 2,
    );
  }

  // Right column - Challenges
  const rightX = LAYOUT.margin + colWidth + LAYOUT.columnGap;
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", "bold");
  pdf.text("Areas for Growth", rightX, y + 15);

  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");
  let rightY = y + 22;

  const displayChallenges = isPremium ? challenges : challenges.slice(0, 3);
  displayChallenges.forEach((challenge) => {
    pdf.text("•", rightX, rightY);
    const lines = pdf.splitTextToSize(challenge, colWidth - 10);
    pdf.text(lines, rightX + 5, rightY);
    rightY += lines.length * 4 + 2;
  });

  if (!isPremium && challenges.length > 3) {
    pdf.setTextColor(...COLORS.accent);
    pdf.setFontSize(FONTS.caption.size);
    pdf.text(`+${challenges.length - 3} more in Premium`, rightX, rightY + 2);
  }
};

// Aspects section
const addAspectsSection = (pdf: jsPDF, reportData: ReportData, y: number) => {
  // Section title
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont("helvetica", FONTS.heading.weight);
  pdf.text("ASPECTS", LAYOUT.margin, y);

  const aspectsY = y + 15;
  const aspects = reportData.chartData?.aspects || reportData.aspectTable || [];
  const majorAspects = aspects.slice(0, 8);

  // Create a simple aspects grid
  const cols = 4;
  const rows = Math.ceil(majorAspects.length / cols);
  const cellWidth = (LAYOUT.pageWidth - LAYOUT.margin * 2) / cols;
  const cellHeight = 15;

  majorAspects.forEach((aspect, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = LAYOUT.margin + col * cellWidth;
    const cellY = aspectsY + row * cellHeight;

    // Aspect symbol and description
    pdf.setFontSize(FONTS.body.size);
    pdf.setTextColor(...COLORS.primary);
    const aspectText = `${aspect.planet1} ${getAspectSymbol(aspect.aspect)} ${aspect.planet2}`;
    pdf.text(aspectText, x + 2, cellY + 8);
  });
};

// Recommendations section
const addRecommendationsSection = (
  pdf: jsPDF,
  recommendations: string[],
  y: number,
  isPremium: boolean,
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

  const displayRecs = isPremium ? recommendations : recommendations.slice(0, 4);
  displayRecs.forEach((rec, index) => {
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

  if (!isPremium && recommendations.length > 4) {
    pdf.setTextColor(...COLORS.accent);
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `🔒 ${recommendations.length - 4} more recommendations in Premium Report`,
      LAYOUT.margin,
      currentY + 5,
    );
  }
};

// Premium upgrade section for free reports
const addPremiumUpgradeSection = (pdf: jsPDF, y: number) => {
  const contentWidth = LAYOUT.pageWidth - LAYOUT.margin * 2;

  // Background box
  pdf.setFillColor(255, 248, 220); // Light yellow background
  pdf.roundedRect(LAYOUT.margin, y, contentWidth, 50, 3, 3, "F");

  // Border
  pdf.setDrawColor(...COLORS.accent);
  pdf.setLineWidth(1);
  pdf.roundedRect(LAYOUT.margin, y, contentWidth, 50, 3, 3, "S");

  // Crown icon
  pdf.setTextColor(...COLORS.accent);
  pdf.setFontSize(20);
  pdf.text("👑", LAYOUT.margin + 10, y + 15);

  // Upgrade text
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.subheading.size);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "UNLOCK YOUR COMPLETE ASTROLOGICAL PROFILE",
    LAYOUT.margin + 25,
    y + 12,
  );

  pdf.setFontSize(FONTS.body.size);
  pdf.setFont("helvetica", "normal");
  const upgradeText =
    "Upgrade to Premium for detailed interpretations, comprehensive analysis, \ncareer guidance, relationship insights, and personalized recommendations.";
  pdf.text(upgradeText, LAYOUT.margin + 25, y + 20);

  // Call to action
  pdf.setTextColor(...COLORS.accent);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "Visit MysticBanana.com to upgrade now!",
    LAYOUT.margin + 25,
    y + 35,
  );
};

// Enhanced birth chart generation matching sample with improved size and clarity
const generateEnhancedBirthChart = async (
  chartData: BirthChartData,
  isPremium: boolean = false,
): Promise<string | null> => {
  try {
    const canvas = document.createElement("canvas");
    const size = 800; // Increased size for better clarity
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // High DPI scaling for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    // Cream background
    ctx.fillStyle = "#F5F0EB";
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 60; // More padding
    const innerRadius = outerRadius * 0.7;

    // Outer circle with better styling
    ctx.strokeStyle = "#8B6947";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner circle
    ctx.strokeStyle = "#C8A882";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // House divisions with better visibility
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      ctx.strokeStyle = "#D4C4A8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // House numbers
      const houseX =
        centerX + Math.cos(angle + Math.PI / 12) * (outerRadius * 0.92);
      const houseY =
        centerY + Math.sin(angle + Math.PI / 12) * (outerRadius * 0.92);
      ctx.fillStyle = "#8B6947";
      ctx.font = "bold 14px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((i + 1).toString(), houseX, houseY);
    }

    // Zodiac signs with larger, clearer symbols
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

    ctx.fillStyle = "#8B6947";
    ctx.font = "bold 24px serif"; // Larger font
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    Object.entries(zodiacSymbols).forEach(([sign, symbol], index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * (outerRadius * 0.78);
      const y = centerY + Math.sin(angle) * (outerRadius * 0.78);
      ctx.fillText(symbol, x, y);
    });

    // Planets with improved visibility
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

    const planetColors = {
      Sun: "#FFD700",
      Moon: "#C0C0C0",
      Mercury: "#FFA500",
      Venus: "#FF69B4",
      Mars: "#FF4500",
      Jupiter: "#4169E1",
      Saturn: "#8B4513",
      Uranus: "#00CED1",
      Neptune: "#4682B4",
      Pluto: "#800080",
    };

    chartData.planets.forEach((planet) => {
      if (planetSymbols[planet.name]) {
        const angle = (planet.longitude - 90) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * (innerRadius * 0.85);
        const y = centerY + Math.sin(angle) * (innerRadius * 0.85);

        // Planet circle with better visibility
        ctx.fillStyle = planetColors[planet.name] || "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, 2 * Math.PI); // Larger circles
        ctx.fill();
        ctx.strokeStyle = "#8B6947";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Planet symbol with better contrast
        ctx.fillStyle = "#000000";
        ctx.font = "bold 18px serif"; // Larger symbols
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(planetSymbols[planet.name], x, y);
      }
    });

    // Aspects with improved visibility
    if (isPremium && chartData.aspects) {
      chartData.aspects.slice(0, 8).forEach((aspect) => {
        const planet1 = chartData.planets.find(
          (p) => p.name === aspect.planet1,
        );
        const planet2 = chartData.planets.find(
          (p) => p.name === aspect.planet2,
        );

        if (planet1 && planet2) {
          const angle1 = (planet1.longitude - 90) * (Math.PI / 180);
          const angle2 = (planet2.longitude - 90) * (Math.PI / 180);

          const x1 = centerX + Math.cos(angle1) * (innerRadius * 0.7);
          const y1 = centerY + Math.sin(angle1) * (innerRadius * 0.7);
          const x2 = centerX + Math.cos(angle2) * (innerRadius * 0.7);
          const y2 = centerY + Math.sin(angle2) * (innerRadius * 0.7);

          const aspectColors = {
            conjunction: "#FF0000",
            opposition: "#FF4500",
            trine: "#00AA00",
            square: "#FF0000",
            sextile: "#0066FF",
            quincunx: "#800080",
          };

          ctx.strokeStyle = aspectColors[aspect.aspect] || "#888888";
          ctx.lineWidth = aspect.exact ? 3 : 2;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    }

    return canvas.toDataURL("image/png", 1.0); // Maximum quality
  } catch (error) {
    console.error("Failed to generate enhanced birth chart:", error);
    return null;
  }
};

// Helper functions
const calculateTextHeight = (
  pdf: jsPDF,
  text: string,
  width: number,
): number => {
  const lines = pdf.splitTextToSize(text, width);
  return lines.length * LAYOUT.lineHeight;
};

const getPlanetDescription = (planetName: string, sign: string): string => {
  const descriptions = {
    Sun: `Courageous, authentic, and finds or conducts himself`,
    Moon: `Rising, time at here`,
    Mercury: `Communication and intellectual pursuits`,
    Venus: `Venus depicts ad ascetic, cloumilla`,
    Mars: `Energy, drive, and assertiveness`,
    Jupiter: `Wisdom, expansion, and good fortune`,
    Saturn: `Discipline, responsibility, and life lessons`,
    Uranus: `Innovation, rebellion, and sudden changes`,
    Neptune: `Dreams, spirituality, and illusions`,
    Pluto: `Transformation, power, and regeneration`,
  };
  return (
    descriptions[planetName] ||
    `${planetName} in ${sign} influences your personality`
  );
};

const getAspectSymbol = (aspectName: string): string => {
  const symbols = {
    conjunction: "☌",
    opposition: "☍",
    trine: "△",
    square: "□",
    sextile: "⚹",
    quincunx: "⚻",
  };
  return symbols[aspectName] || "○";
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
- introduction: Warm, engaging introduction (${reportData.isPremium ? "200-300" : "100-150"} words)
- personalityAnalysis: Deep personality analysis (${reportData.isPremium ? "300-400" : "150-200"} words)
- strengths: Array of ${reportData.isPremium ? "8-10" : "5-6"} key strengths
- challenges: Array of ${reportData.isPremium ? "6-8" : "4-5"} growth areas
- recommendations: Array of ${reportData.isPremium ? "10-12" : "6-8"} actionable recommendations
- conclusion: Inspiring conclusion (${reportData.isPremium ? "150-200" : "100-120"} words)

Make it professional, personalized, and ${reportData.isPremium ? "comprehensive with deep insights" : "concise but compelling to encourage premium upgrade"}.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional astrologer creating personalized reports that help users introspect their lives.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: reportData.isPremium ? 2500 : 1200,
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
    introduction: `Welcome to your personalized ${reportData.reportType} astrology report, ${reportData.userName}. This ${reportData.isPremium ? "comprehensive" : "introductory"} analysis explores the cosmic influences that shape your unique personality and life path. ${reportData.isPremium ? "Through detailed examination of your planetary positions, aspects, and chart patterns, we reveal the deeper layers of your astrological profile." : "Discover the fundamental aspects of your cosmic blueprint."}`,
    personalityAnalysis: `Your astrological profile reveals a ${reportData.isPremium ? "complex and multifaceted" : "unique"} personality. The planetary positions at your birth create a ${reportData.isPremium ? "distinctive cosmic fingerprint that influences your thoughts, emotions, actions, and life experiences in profound ways. Your chart shows remarkable patterns that speak to your core nature and potential for growth." : "cosmic signature that influences your natural tendencies and potential."}`,
    strengths: reportData.isPremium
      ? [
          "Natural leadership abilities and charismatic presence that inspires others",
          "Strong intuition and emotional intelligence that guides decision-making",
          "Excellent communication skills and ability to connect with diverse people",
          "Creative problem-solving capabilities and innovative thinking",
          "Resilience and adaptability in challenging situations",
          "Deep empathy and understanding of human nature",
          "Strong sense of justice and fairness in all dealings",
          "Natural ability to see the bigger picture and long-term consequences",
          "Magnetic personality that draws opportunities and positive relationships",
          "Innate wisdom and philosophical understanding of life",
        ]
      : [
          "Natural leadership abilities and charismatic presence",
          "Strong intuition and emotional intelligence",
          "Excellent communication and interpersonal skills",
          "Creative problem-solving capabilities",
          "Resilience and adaptability in challenging situations",
          "Deep empathy and understanding of others",
        ],
    challenges: reportData.isPremium
      ? [
          "Tendency to be overly critical of yourself and perfectionist in nature",
          "Difficulty in making quick decisions when under pressure or stress",
          "Sometimes struggle with maintaining healthy work-life balance",
          "May avoid confrontation even when it's necessary for growth",
          "Perfectionist tendencies that can cause unnecessary stress and anxiety",
          "Occasional self-doubt that prevents you from fully embracing opportunities",
          "Tendency to overthink situations and analyze them to exhaustion",
          "May have difficulty saying no to others' requests and demands",
        ]
      : [
          "Tendency to be overly critical of yourself",
          "Difficulty in making quick decisions under pressure",
          "Sometimes struggle with work-life balance",
          "May avoid confrontation even when necessary",
          "Perfectionist tendencies that can cause stress",
        ],
    recommendations: reportData.isPremium
      ? [
          "Practice daily meditation or mindfulness to center yourself and reduce anxiety",
          "Set clear boundaries between work and personal time for better balance",
          "Trust your intuition more when making important life decisions",
          "Engage in creative activities that bring you joy and self-expression",
          "Build a strong support network of trusted friends and mentors",
          "Focus on self-compassion and celebrate your achievements regularly",
          "Develop a regular exercise routine to channel your abundant energy",
          "Practice assertiveness skills to communicate your needs effectively",
          "Explore spiritual or philosophical studies that resonate with your soul",
          "Consider professional development in areas that align with your natural talents",
          "Create a vision board or journal to manifest your deepest desires",
          "Seek opportunities for leadership roles that utilize your natural abilities",
        ]
      : [
          "Practice daily meditation or mindfulness to center yourself",
          "Set clear boundaries between work and personal time",
          "Trust your intuition more when making important decisions",
          "Engage in creative activities that bring you joy",
          "Build a strong support network of trusted friends",
          "Focus on self-compassion and celebrate your achievements",
        ],
    conclusion: reportData.isPremium
      ? `Your astrological journey is unique and filled with tremendous potential for growth, success, and fulfillment. The cosmic influences revealed in this comprehensive analysis provide a roadmap for understanding your deepest motivations, natural talents, and life purpose. Use these insights to make conscious choices that align with your true nature and highest aspirations. Remember that astrology is a tool for self-awareness and empowerment - your free will and conscious actions ultimately shape your destiny. Embrace your cosmic gifts, work on your challenges with compassion, and trust in your ability to create the life you truly desire.`
      : `Your astrological journey is unique and filled with potential. These insights provide a foundation for understanding your cosmic blueprint and natural tendencies. Use this knowledge to make conscious choices that align with your true nature. For deeper insights into your career path, relationships, spiritual purpose, and detailed yearly forecasts, consider upgrading to our Premium Report for a complete astrological analysis.`,
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
      backgroundColor: "#F5F0EB",
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

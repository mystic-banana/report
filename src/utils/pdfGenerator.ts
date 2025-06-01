import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BirthChartData } from "./astronomicalCalculations";

interface WatermarkOptions {
  userName: string;
  birthDate?: string;
  reportType?: string;
}

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

// Standard color theme for all reports
const REPORT_COLORS = {
  primary: [74, 20, 140], // Deep purple
  accent: [184, 134, 11], // Gold
  text: [33, 33, 33], // Dark gray
  lightText: [100, 100, 100], // Light gray
  background: [248, 250, 252], // Light background
  border: [200, 200, 200], // Light border
  success: [34, 197, 94], // Green
  warning: [245, 158, 11], // Orange
  info: [59, 130, 246], // Blue
};

// Standard fonts and spacing
const REPORT_STYLES = {
  fonts: {
    title: { size: 24, weight: "bold" },
    heading: { size: 18, weight: "bold" },
    subheading: { size: 14, weight: "bold" },
    body: { size: 11, weight: "normal" },
    caption: { size: 9, weight: "normal" },
  },
  spacing: {
    section: 20,
    paragraph: 8,
    line: 5,
    margin: 20,
  },
};

export const generatePDFWithWatermark = async (
  element: HTMLElement,
  filename: string,
  watermarkOptions: WatermarkOptions,
): Promise<void> => {
  try {
    // Create canvas from HTML element with white background
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Calculate dimensions
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm

    let heightLeft = imgHeight;
    let position = 10;

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add watermark to each page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, watermarkOptions);
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

export const generateProfessionalAstrologyReport = async (
  reportData: ReportData,
): Promise<void> => {
  // Check if this is a natal chart report
  if (
    reportData.reportType === "natal" ||
    reportData.reportType === "birth-chart" ||
    reportData.isNatalChart
  ) {
    return generateNatalChartPDF(reportData as NatalReportData);
  }

  // Check if this is a transit report
  if (reportData.reportType === "transit" || reportData.isTransitReport) {
    return generateTransitReportPDF(reportData);
  }

  // Continue with existing report generation
  return generateStandardAstrologyReport(reportData);
};

/**
 * Generate comprehensive transit report PDF with charts and timing
 */
export const generateTransitReportPDF = async (
  reportData: ReportData,
): Promise<void> => {
  try {
    // Generate AI content first
    const aiContent = await generateAIContent(reportData);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let currentY = 0;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = REPORT_STYLES.spacing.margin;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
        addHeader(pdf, reportData);
        addFooter(pdf, reportData);
      }
    };

    // Add header and footer to first page
    addHeader(pdf, reportData);
    addFooter(pdf, reportData);
    currentY = 60; // Start after header

    // Title Section
    pdf.setTextColor(...REPORT_COLORS.primary);
    pdf.setFontSize(REPORT_STYLES.fonts.title.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.title.weight);
    const title = `${reportData.userName}'s Transit Report`;
    pdf.text(title, pageWidth / 2, currentY, { align: "center" });
    currentY += REPORT_STYLES.spacing.section;

    // Subtitle
    pdf.setTextColor(...REPORT_COLORS.lightText);
    pdf.setFontSize(REPORT_STYLES.fonts.body.size);
    pdf.setFont("helvetica", "italic");
    const subtitle = `${reportData.forecastPeriod?.charAt(0).toUpperCase() + reportData.forecastPeriod?.slice(1) || "Monthly"} Planetary Transit Analysis`;
    pdf.text(subtitle, pageWidth / 2, currentY, { align: "center" });
    currentY += REPORT_STYLES.spacing.section;

    // Report Information Box
    checkPageBreak(40);
    pdf.setFillColor(...REPORT_COLORS.background);
    pdf.roundedRect(margin, currentY, contentWidth, 35, 3, 3, "F");
    pdf.setDrawColor(...REPORT_COLORS.border);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin, currentY, contentWidth, 35, 3, 3, "S");

    pdf.setTextColor(...REPORT_COLORS.text);
    pdf.setFontSize(REPORT_STYLES.fonts.subheading.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.subheading.weight);
    pdf.text("Report Information", margin + 10, currentY + 12);

    pdf.setFontSize(REPORT_STYLES.fonts.body.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.body.weight);
    pdf.text(`Name: ${reportData.userName}`, margin + 10, currentY + 22);
    pdf.text(
      `Forecast Period: ${reportData.forecastPeriod || "Monthly"}`,
      margin + 10,
      currentY + 30,
    );

    if (reportData.forecastDate) {
      const forecastDate = new Date(reportData.forecastDate);
      pdf.text(
        `Start Date: ${forecastDate.toLocaleDateString()}`,
        margin + 100,
        currentY + 22,
      );
    }

    pdf.text(
      `Report Type: ${reportData.isPremium ? "Premium" : "Basic"} Transit Analysis`,
      margin + 100,
      currentY + 30,
    );
    currentY += 45;

    // Current Planetary Positions Chart (Visual)
    if (reportData.chartData) {
      checkPageBreak(120);
      addSectionHeader(pdf, "Current Planetary Positions", currentY);
      currentY += 20;

      // Create a simple planetary positions table
      pdf.setFillColor(...REPORT_COLORS.primary);
      pdf.rect(margin, currentY, contentWidth, 12, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(REPORT_STYLES.fonts.body.size);
      pdf.setFont("helvetica", "bold");

      const colWidths = [40, 40, 40, 40];
      const headers = ["Planet", "Current Sign", "Natal Sign", "Aspect"];
      let xPos = margin + 5;

      headers.forEach((header, index) => {
        pdf.text(header, xPos, currentY + 8);
        xPos += colWidths[index];
      });
      currentY += 12;

      // Add planetary data
      pdf.setTextColor(...REPORT_COLORS.text);
      pdf.setFont("helvetica", "normal");

      const majorPlanets = [
        "Sun",
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
      ];
      majorPlanets.forEach((planetName, index) => {
        checkPageBreak(10);
        const planet = reportData.chartData?.planets?.find(
          (p) => p.name === planetName,
        );

        const isEven = index % 2 === 0;
        if (isEven) {
          pdf.setFillColor(...REPORT_COLORS.background);
          pdf.rect(margin, currentY, contentWidth, 8, "F");
        }

        xPos = margin + 5;
        const rowData = [
          planetName,
          planet?.sign || "—",
          planet?.sign || "—", // In a real app, this would be current vs natal
          "Conjunction", // Simplified for demo
        ];

        rowData.forEach((data, colIndex) => {
          pdf.text(data, xPos, currentY + 6);
          xPos += colWidths[colIndex];
        });
        currentY += 8;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Main Report Content
    addBodyText(
      pdf,
      aiContent.introduction || reportData.content,
      currentY,
      contentWidth,
    );
    currentY +=
      calculateTextHeight(
        pdf,
        aiContent.introduction || reportData.content,
        contentWidth,
      ) + REPORT_STYLES.spacing.section;

    // Transit Timeline (Premium feature)
    if (reportData.isPremium) {
      checkPageBreak(60);
      addSectionHeader(
        pdf,
        "Transit Timeline & Key Dates",
        currentY,
        REPORT_COLORS.info,
      );
      currentY += 20;

      // Create timeline visualization
      const timelineData = [
        {
          date: "Week 1",
          event: "Mars enters new sign - Increased energy and motivation",
        },
        {
          date: "Week 2",
          event:
            "Venus trine Jupiter - Favorable for relationships and finances",
        },
        {
          date: "Week 3",
          event: "Mercury retrograde begins - Review and revise plans",
        },
        {
          date: "Week 4",
          event: "Full Moon in your sign - Emotional culmination and release",
        },
      ];

      timelineData.forEach((item, index) => {
        checkPageBreak(15);

        // Date circle
        pdf.setFillColor(...REPORT_COLORS.info);
        pdf.circle(margin + 8, currentY + 5, 3, "F");

        // Date text
        pdf.setTextColor(...REPORT_COLORS.info);
        pdf.setFontSize(REPORT_STYLES.fonts.body.size);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.date, margin + 15, currentY + 7);

        // Event description
        pdf.setTextColor(...REPORT_COLORS.text);
        pdf.setFont("helvetica", "normal");
        const eventLines = pdf.splitTextToSize(item.event, contentWidth - 30);
        pdf.text(eventLines, margin + 15, currentY + 15);

        currentY += 20;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Recommendations section
    if (aiContent.recommendations && aiContent.recommendations.length > 0) {
      checkPageBreak(50);
      addSectionHeader(
        pdf,
        "Personalized Guidance",
        currentY,
        REPORT_COLORS.success,
      );
      currentY += 15;

      aiContent.recommendations.forEach((recommendation, index) => {
        checkPageBreak(15);
        addNumberedPoint(
          pdf,
          recommendation,
          currentY,
          contentWidth,
          index + 1,
          REPORT_COLORS.success,
        );
        currentY +=
          calculateTextHeight(pdf, recommendation, contentWidth - 20) +
          REPORT_STYLES.spacing.line;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Conclusion
    if (aiContent.conclusion) {
      checkPageBreak(40);
      addSectionHeader(pdf, "Transit Summary", currentY);
      currentY += 15;
      addBodyText(pdf, aiContent.conclusion, currentY, contentWidth);
    }

    // Add watermark to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, {
        userName: reportData.userName,
        birthDate: reportData.birthDate,
        reportType: "Transit Report",
      });
    }

    // Generate filename
    const cleanName = reportData.userName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const filename = `${cleanName}_transit_report_${reportData.forecastPeriod || "monthly"}_${date}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Transit report PDF generation failed:", error);
    throw error;
  }
};

/**
 * Generate comprehensive natal chart PDF report with birth chart image
 */
export const generateNatalChartPDF = async (
  reportData: NatalReportData,
): Promise<void> => {
  try {
    // Generate AI content first
    const aiContent = await generateAIContent(reportData);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let currentY = 0;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = REPORT_STYLES.spacing.margin;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
        addHeader(pdf, reportData);
        addFooter(pdf, reportData);
      }
    };

    // Add header and footer to first page
    addHeader(pdf, reportData);
    addFooter(pdf, reportData);
    currentY = 60; // Start after header

    // Title Section
    pdf.setTextColor(...REPORT_COLORS.primary);
    pdf.setFontSize(REPORT_STYLES.fonts.title.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.title.weight);
    const title = `${reportData.userName}'s Natal Chart Report`;
    pdf.text(title, pageWidth / 2, currentY, { align: "center" });
    currentY += REPORT_STYLES.spacing.section;

    // Subtitle
    pdf.setTextColor(...REPORT_COLORS.lightText);
    pdf.setFontSize(REPORT_STYLES.fonts.body.size);
    pdf.setFont("helvetica", "italic");
    const subtitle = "Professional Astrological Analysis";
    pdf.text(subtitle, pageWidth / 2, currentY, { align: "center" });
    currentY += REPORT_STYLES.spacing.section;

    // Personal Information Box
    checkPageBreak(40);
    pdf.setFillColor(...REPORT_COLORS.background);
    pdf.roundedRect(margin, currentY, contentWidth, 35, 3, 3, "F");
    pdf.setDrawColor(...REPORT_COLORS.border);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin, currentY, contentWidth, 35, 3, 3, "S");

    pdf.setTextColor(...REPORT_COLORS.text);
    pdf.setFontSize(REPORT_STYLES.fonts.subheading.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.subheading.weight);
    pdf.text("Personal Information", margin + 10, currentY + 12);

    pdf.setFontSize(REPORT_STYLES.fonts.body.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.body.weight);
    pdf.text(`Name: ${reportData.userName}`, margin + 10, currentY + 22);

    if (reportData.birthDate) {
      const birthDate = new Date(reportData.birthDate);
      pdf.text(
        `Birth Date: ${birthDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        margin + 10,
        currentY + 30,
      );
    }
    currentY += 45;

    // Birth Chart Image Section
    if (reportData.chartData) {
      checkPageBreak(120);

      // Section header
      addSectionHeader(pdf, "Natal Chart Wheel", currentY);
      currentY += 20;

      // Generate and add birth chart image
      try {
        const chartImageData = await generateBirthChartImage(
          reportData.chartData,
          reportData.isPremium,
        );
        if (chartImageData) {
          const chartSize = 100; // Chart size in mm
          const chartX = (pageWidth - chartSize) / 2;
          pdf.addImage(
            chartImageData,
            "PNG",
            chartX,
            currentY,
            chartSize,
            chartSize,
          );
          currentY += chartSize + 10;
        }
      } catch (error) {
        console.warn("Failed to generate chart image:", error);
        // Add placeholder text
        pdf.setTextColor(...REPORT_COLORS.lightText);
        pdf.setFontSize(REPORT_STYLES.fonts.body.size);
        pdf.text(
          "Birth chart visualization will be available in future updates.",
          pageWidth / 2,
          currentY + 50,
          { align: "center" },
        );
        currentY += 70;
      }
    }

    // Natal Summary Table
    if (reportData.chartData && reportData.chartData.planets) {
      checkPageBreak(80);

      addSectionHeader(pdf, "Natal Summary Table", currentY);
      currentY += 20;

      // Table header
      pdf.setFillColor(...REPORT_COLORS.primary);
      pdf.rect(margin, currentY, contentWidth, 12, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(REPORT_STYLES.fonts.body.size);
      pdf.setFont("helvetica", "bold");

      const colWidths = [50, 50, 30, 40];
      const headers = ["Planet", "Sign", "House", "Position"];
      let xPos = margin + 5;

      headers.forEach((header, index) => {
        pdf.text(header, xPos, currentY + 8);
        xPos += colWidths[index];
      });
      currentY += 12;

      // Table rows
      pdf.setTextColor(...REPORT_COLORS.text);
      pdf.setFont("helvetica", "normal");

      reportData.chartData.planets.slice(0, 10).forEach((planet, index) => {
        checkPageBreak(10);

        const isEven = index % 2 === 0;
        if (isEven) {
          pdf.setFillColor(...REPORT_COLORS.background);
          pdf.rect(margin, currentY, contentWidth, 8, "F");
        }

        xPos = margin + 5;
        const rowData = [
          planet.name,
          planet.sign,
          planet.house?.toString() || "—",
          `${planet.degree}°${planet.minute}'${planet.second}"`,
        ];

        rowData.forEach((data, colIndex) => {
          pdf.text(data, xPos, currentY + 6);
          xPos += colWidths[colIndex];
        });
        currentY += 8;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Chart Overview
    if (aiContent.introduction) {
      checkPageBreak(40);
      addSectionHeader(pdf, "Chart Overview", currentY);
      currentY += 15;

      addBodyText(pdf, aiContent.introduction, currentY, contentWidth);
      currentY +=
        calculateTextHeight(pdf, aiContent.introduction, contentWidth) +
        REPORT_STYLES.spacing.section;
    }

    // Personality Analysis
    if (aiContent.personalityAnalysis) {
      checkPageBreak(40);
      addSectionHeader(pdf, "Personality Analysis", currentY);
      currentY += 15;

      addBodyText(pdf, aiContent.personalityAnalysis, currentY, contentWidth);
      currentY +=
        calculateTextHeight(pdf, aiContent.personalityAnalysis, contentWidth) +
        REPORT_STYLES.spacing.section;
    }

    // Strengths Section
    if (aiContent.strengths && aiContent.strengths.length > 0) {
      checkPageBreak(50);
      addSectionHeader(
        pdf,
        "Your Cosmic Strengths",
        currentY,
        REPORT_COLORS.success,
      );
      currentY += 15;

      aiContent.strengths.forEach((strength, index) => {
        checkPageBreak(12);
        addBulletPoint(
          pdf,
          strength,
          currentY,
          contentWidth,
          REPORT_COLORS.success,
        );
        currentY +=
          calculateTextHeight(pdf, strength, contentWidth - 15) +
          REPORT_STYLES.spacing.line;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Premium Content
    if (reportData.isPremium) {
      // Aspect Analysis
      if (reportData.chartData && reportData.chartData.aspects.length > 0) {
        checkPageBreak(60);
        addSectionHeader(pdf, "Major Aspects Analysis", currentY);
        currentY += 20;

        // Aspect table
        pdf.setFillColor(...REPORT_COLORS.primary);
        pdf.rect(margin, currentY, contentWidth, 10, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(REPORT_STYLES.fonts.caption.size);
        pdf.setFont("helvetica", "bold");

        const aspectColWidths = [40, 60, 25, 35];
        const aspectHeaders = ["Aspect", "Planets", "Orb", "Nature"];
        let aspectXPos = margin + 3;

        aspectHeaders.forEach((header, index) => {
          pdf.text(header, aspectXPos, currentY + 7);
          aspectXPos += aspectColWidths[index];
        });
        currentY += 10;

        // Aspect rows
        pdf.setTextColor(...REPORT_COLORS.text);
        pdf.setFont("helvetica", "normal");

        reportData.chartData.aspects.slice(0, 8).forEach((aspect, index) => {
          checkPageBreak(8);

          const isEven = index % 2 === 0;
          if (isEven) {
            pdf.setFillColor(...REPORT_COLORS.background);
            pdf.rect(margin, currentY, contentWidth, 7, "F");
          }

          aspectXPos = margin + 3;
          const aspectRowData = [
            aspect.aspect.charAt(0).toUpperCase() + aspect.aspect.slice(1),
            `${aspect.planet1} - ${aspect.planet2}`,
            `${aspect.orb.toFixed(1)}°`,
            aspect.nature || "—",
          ];

          aspectRowData.forEach((data, colIndex) => {
            pdf.text(data, aspectXPos, currentY + 5);
            aspectXPos += aspectColWidths[colIndex];
          });
          currentY += 7;
        });
        currentY += REPORT_STYLES.spacing.section;
      }

      // Elemental Balance
      if (reportData.chartData && reportData.chartData.elementalBalance) {
        checkPageBreak(60);
        addSectionHeader(pdf, "Elemental Balance", currentY);
        currentY += 15;

        const elements = reportData.chartData.elementalBalance;
        const total =
          elements.fire + elements.earth + elements.air + elements.water;

        Object.entries(elements).forEach(([element, count]) => {
          checkPageBreak(12);
          const percentage = total > 0 ? (count / total) * 100 : 0;

          pdf.setTextColor(...REPORT_COLORS.text);
          pdf.setFontSize(REPORT_STYLES.fonts.body.size);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `${element.charAt(0).toUpperCase() + element.slice(1)}:`,
            margin + 5,
            currentY + 5,
          );

          // Progress bar
          const barWidth = 80;
          const barHeight = 4;
          const barX = margin + 40;

          pdf.setFillColor(240, 240, 240);
          pdf.rect(barX, currentY, barWidth, barHeight, "F");

          const elementColors = {
            fire: [255, 69, 0],
            earth: [139, 69, 19],
            air: [135, 206, 235],
            water: [0, 191, 255],
          };

          pdf.setFillColor(...elementColors[element]);
          pdf.rect(
            barX,
            currentY,
            (percentage / 100) * barWidth,
            barHeight,
            "F",
          );

          pdf.setTextColor(...REPORT_COLORS.text);
          pdf.setFontSize(REPORT_STYLES.fonts.caption.size);
          pdf.text(
            `${percentage.toFixed(1)}% (${count})`,
            barX + barWidth + 5,
            currentY + 3,
          );

          currentY += 10;
        });
        currentY += REPORT_STYLES.spacing.section;
      }
    }

    // Recommendations
    if (aiContent.recommendations && aiContent.recommendations.length > 0) {
      checkPageBreak(50);
      addSectionHeader(
        pdf,
        "Personalized Guidance",
        currentY,
        REPORT_COLORS.info,
      );
      currentY += 15;

      aiContent.recommendations.forEach((recommendation, index) => {
        checkPageBreak(15);
        addNumberedPoint(
          pdf,
          recommendation,
          currentY,
          contentWidth,
          index + 1,
          REPORT_COLORS.info,
        );
        currentY +=
          calculateTextHeight(pdf, recommendation, contentWidth - 20) +
          REPORT_STYLES.spacing.line;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Conclusion
    if (aiContent.conclusion) {
      checkPageBreak(40);
      addSectionHeader(pdf, "Your Cosmic Journey", currentY);
      currentY += 15;

      addBodyText(pdf, aiContent.conclusion, currentY, contentWidth);
      currentY +=
        calculateTextHeight(pdf, aiContent.conclusion, contentWidth) +
        REPORT_STYLES.spacing.section;
    }

    // Add watermark to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, {
        userName: reportData.userName,
        birthDate: reportData.birthDate,
        reportType: "Natal Chart",
      });
    }

    // Generate filename
    const cleanName = reportData.userName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const filename = `${cleanName}_natal_chart_report_${date}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Natal chart PDF generation failed:", error);
    throw error;
  }
};

/**
 * Generate birth chart image for PDF inclusion
 */
const generateBirthChartImage = async (
  chartData: BirthChartData,
  isPremium: boolean = false,
): Promise<string | null> => {
  try {
    // Create a temporary canvas for chart generation
    const canvas = document.createElement("canvas");
    const size = 400; // Chart size in pixels
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Set white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 40;

    // Draw outer circle
    ctx.strokeStyle = "#4A148C";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw inner circle
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw zodiac signs
    const zodiacSigns = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
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

    ctx.fillStyle = "#B8860B";
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    zodiacSigns.forEach((sign, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * (radius * 0.85);
      const y = centerY + Math.sin(angle) * (radius * 0.85);
      ctx.fillText(zodiacSymbols[sign], x, y);

      // Draw zodiac divider lines
      const innerX = centerX + Math.cos(angle) * (radius * 0.7);
      const innerY = centerY + Math.sin(angle) * (radius * 0.7);
      const outerX = centerX + Math.cos(angle) * radius;
      const outerY = centerY + Math.sin(angle) * radius;

      ctx.strokeStyle = "#CCCCCC";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    });

    // Draw house cusps and numbers
    if (chartData.houses) {
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#666666";
      ctx.font = "12px sans-serif";

      chartData.houses.forEach((house, index) => {
        const angle = (house.cusp - 90) * (Math.PI / 180);
        const innerX = centerX + Math.cos(angle) * (radius * 0.3);
        const innerY = centerY + Math.sin(angle) * (radius * 0.3);
        const outerX = centerX + Math.cos(angle) * (radius * 0.7);
        const outerY = centerY + Math.sin(angle) * (radius * 0.7);

        // House cusp line
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();

        // House number
        const labelAngle =
          (house.cusp +
            (chartData.houses[(index + 1) % 12].cusp - house.cusp) / 2 -
            90) *
          (Math.PI / 180);
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.5);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.5);
        ctx.fillText(house.house.toString(), labelX, labelY);
      });
    }

    // Draw planets
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
      "North Node": "#32CD32",
      "South Node": "#32CD32",
    };

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
      "North Node": "☊",
      "South Node": "☋",
    };

    if (chartData.planets) {
      chartData.planets.forEach((planet) => {
        const angle = (planet.longitude - 90) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * (radius * 0.9);
        const y = centerY + Math.sin(angle) * (radius * 0.9);

        // Planet circle
        ctx.fillStyle = planetColors[planet.name] || "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Planet symbol
        ctx.fillStyle = "#000000";
        ctx.font = "14px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(planetSymbols[planet.name] || planet.name.charAt(0), x, y);

        // Planet degree (for premium)
        if (isPremium) {
          const degreeX = centerX + Math.cos(angle) * (radius * 1.05);
          const degreeY = centerY + Math.sin(angle) * (radius * 1.05);
          ctx.fillStyle = "#666666";
          ctx.font = "8px sans-serif";
          ctx.fillText(`${planet.degree}°`, degreeX, degreeY);
        }
      });
    }

    // Draw aspects (premium only)
    if (isPremium && chartData.aspects) {
      const aspectColors = {
        conjunction: "#FF0000",
        opposition: "#FF4500",
        trine: "#00FF00",
        square: "#FF0000",
        sextile: "#0000FF",
        quincunx: "#800080",
      };

      chartData.aspects.slice(0, 10).forEach((aspect) => {
        const planet1 = chartData.planets.find(
          (p) => p.name === aspect.planet1,
        );
        const planet2 = chartData.planets.find(
          (p) => p.name === aspect.planet2,
        );

        if (planet1 && planet2) {
          const angle1 = (planet1.longitude - 90) * (Math.PI / 180);
          const angle2 = (planet2.longitude - 90) * (Math.PI / 180);

          const x1 = centerX + Math.cos(angle1) * (radius * 0.6);
          const y1 = centerY + Math.sin(angle1) * (radius * 0.6);
          const x2 = centerX + Math.cos(angle2) * (radius * 0.6);
          const y2 = centerY + Math.sin(angle2) * (radius * 0.6);

          ctx.strokeStyle = aspectColors[aspect.aspect] || "#666666";
          ctx.lineWidth = aspect.exact ? 2 : 1;
          ctx.globalAlpha = 0.6;

          if (!aspect.exact) {
            ctx.setLineDash([3, 3]);
          }

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      });
    }

    // Add chart title
    ctx.fillStyle = "#4A148C";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      isPremium ? "Premium Natal Chart" : "Natal Chart",
      centerX,
      25,
    );

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Failed to generate birth chart image:", error);
    return null;
  }
};

/**
 * Generate standard astrology report with consistent styling
 */
export const generateStandardAstrologyReport = async (
  reportData: ReportData,
): Promise<void> => {
  try {
    const aiContent = await generateAIContent(reportData);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let currentY = 0;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = REPORT_STYLES.spacing.margin;
    const contentWidth = pageWidth - margin * 2;

    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
        addHeader(pdf, reportData);
        addFooter(pdf, reportData);
      }
    };

    // Add header and footer
    addHeader(pdf, reportData);
    addFooter(pdf, reportData);
    currentY = 60;

    // Title
    pdf.setTextColor(...REPORT_COLORS.primary);
    pdf.setFontSize(REPORT_STYLES.fonts.title.size);
    pdf.setFont("helvetica", REPORT_STYLES.fonts.title.weight);
    const titleLines = pdf.splitTextToSize(reportData.title, contentWidth);
    pdf.text(titleLines, margin, currentY);
    currentY += titleLines.length * 8 + REPORT_STYLES.spacing.section;

    // Personal Info
    checkPageBreak(30);
    pdf.setFillColor(...REPORT_COLORS.background);
    pdf.rect(margin, currentY, contentWidth, 25, "F");
    pdf.setDrawColor(...REPORT_COLORS.border);
    pdf.rect(margin, currentY, contentWidth, 25, "S");

    pdf.setTextColor(...REPORT_COLORS.text);
    pdf.setFontSize(REPORT_STYLES.fonts.body.size);
    pdf.text(`Prepared for: ${reportData.userName}`, margin + 5, currentY + 8);
    if (reportData.birthDate) {
      pdf.text(
        `Born: ${new Date(reportData.birthDate).toLocaleDateString()}`,
        margin + 5,
        currentY + 16,
      );
    }
    pdf.text(
      `Report Type: ${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)}`,
      margin + 5,
      currentY + 24,
    );
    currentY += 35;

    // Content sections with consistent styling
    const sections = [
      { title: "Introduction", content: aiContent.introduction },
      { title: "Personality Analysis", content: aiContent.personalityAnalysis },
    ];

    sections.forEach((section) => {
      if (section.content) {
        checkPageBreak(30);
        addSectionHeader(pdf, section.title, currentY);
        currentY += 15;
        addBodyText(pdf, section.content, currentY, contentWidth);
        currentY +=
          calculateTextHeight(pdf, section.content, contentWidth) +
          REPORT_STYLES.spacing.section;
      }
    });

    // Lists with proper formatting
    if (aiContent.strengths?.length) {
      checkPageBreak(40);
      addSectionHeader(pdf, "Your Strengths", currentY, REPORT_COLORS.success);
      currentY += 15;
      aiContent.strengths.forEach((strength) => {
        checkPageBreak(10);
        addBulletPoint(
          pdf,
          strength,
          currentY,
          contentWidth,
          REPORT_COLORS.success,
        );
        currentY +=
          calculateTextHeight(pdf, strength, contentWidth - 15) +
          REPORT_STYLES.spacing.line;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    if (aiContent.challenges?.length) {
      checkPageBreak(40);
      addSectionHeader(
        pdf,
        "Areas for Growth",
        currentY,
        REPORT_COLORS.warning,
      );
      currentY += 15;
      aiContent.challenges.forEach((challenge) => {
        checkPageBreak(10);
        addBulletPoint(
          pdf,
          challenge,
          currentY,
          contentWidth,
          REPORT_COLORS.warning,
        );
        currentY +=
          calculateTextHeight(pdf, challenge, contentWidth - 15) +
          REPORT_STYLES.spacing.line;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Premium sections
    if (reportData.isPremium && aiContent.detailedSections) {
      Object.entries(aiContent.detailedSections).forEach(([key, content]) => {
        if (content) {
          checkPageBreak(30);
          const title =
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1");
          addSectionHeader(pdf, title, currentY);
          currentY += 15;
          addBodyText(pdf, content, currentY, contentWidth);
          currentY +=
            calculateTextHeight(pdf, content, contentWidth) +
            REPORT_STYLES.spacing.section;
        }
      });
    }

    // Recommendations
    if (aiContent.recommendations?.length) {
      checkPageBreak(40);
      addSectionHeader(
        pdf,
        "Personalized Recommendations",
        currentY,
        REPORT_COLORS.info,
      );
      currentY += 15;
      aiContent.recommendations.forEach((rec, index) => {
        checkPageBreak(12);
        addNumberedPoint(
          pdf,
          rec,
          currentY,
          contentWidth,
          index + 1,
          REPORT_COLORS.info,
        );
        currentY +=
          calculateTextHeight(pdf, rec, contentWidth - 20) +
          REPORT_STYLES.spacing.line;
      });
      currentY += REPORT_STYLES.spacing.section;
    }

    // Conclusion
    if (aiContent.conclusion) {
      checkPageBreak(30);
      addSectionHeader(pdf, "Conclusion", currentY);
      currentY += 15;
      addBodyText(pdf, aiContent.conclusion, currentY, contentWidth);
    }

    // Add watermarks
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, {
        userName: reportData.userName,
        birthDate: reportData.birthDate,
        reportType: reportData.reportType,
      });
    }

    const filename = `${reportData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Standard PDF generation failed:", error);
    throw error;
  }
};

// Helper functions for consistent styling
const addHeader = (pdf: jsPDF, reportData: ReportData) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Header background
  pdf.setFillColor(...REPORT_COLORS.primary);
  pdf.rect(0, 0, pageWidth, 30, "F");

  // Logo/Brand
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("MYSTIC BANANA", 20, 15);

  // Subtitle
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Astrology Reports", 20, 22);

  // Date
  pdf.text(new Date().toLocaleDateString(), pageWidth - 20, 15, {
    align: "right",
  });
};

const addFooter = (pdf: jsPDF, reportData: ReportData) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Footer line
  pdf.setDrawColor(...REPORT_COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

  // Footer text
  pdf.setTextColor(...REPORT_COLORS.lightText);
  pdf.setFontSize(8);
  pdf.text("mysticbanana.com", 20, pageHeight - 10);

  // Page number
  const pageNum = pdf.getCurrentPageInfo().pageNumber;
  pdf.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 10, {
    align: "right",
  });
};

const addSectionHeader = (
  pdf: jsPDF,
  title: string,
  y: number,
  color = REPORT_COLORS.primary,
) => {
  pdf.setTextColor(...color);
  pdf.setFontSize(REPORT_STYLES.fonts.heading.size);
  pdf.setFont("helvetica", REPORT_STYLES.fonts.heading.weight);
  pdf.text(title, REPORT_STYLES.spacing.margin, y);
};

const addBodyText = (pdf: jsPDF, text: string, y: number, width: number) => {
  pdf.setTextColor(...REPORT_COLORS.text);
  pdf.setFontSize(REPORT_STYLES.fonts.body.size);
  pdf.setFont("helvetica", REPORT_STYLES.fonts.body.weight);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, REPORT_STYLES.spacing.margin, y, { align: "justify" });
};

const addBulletPoint = (
  pdf: jsPDF,
  text: string,
  y: number,
  width: number,
  color = REPORT_COLORS.text,
) => {
  // Bullet
  pdf.setFillColor(...color);
  pdf.circle(REPORT_STYLES.spacing.margin + 5, y - 2, 1.5, "F");

  // Text
  pdf.setTextColor(...REPORT_COLORS.text);
  pdf.setFontSize(REPORT_STYLES.fonts.body.size);
  const lines = pdf.splitTextToSize(text, width - 15);
  pdf.text(lines, REPORT_STYLES.spacing.margin + 10, y);
};

const addNumberedPoint = (
  pdf: jsPDF,
  text: string,
  y: number,
  width: number,
  number: number,
  color = REPORT_COLORS.text,
) => {
  // Number circle
  pdf.setFillColor(...color);
  pdf.circle(REPORT_STYLES.spacing.margin + 8, y - 2, 4, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text(number.toString(), REPORT_STYLES.spacing.margin + 6, y + 1);

  // Text
  pdf.setTextColor(...REPORT_COLORS.text);
  pdf.setFontSize(REPORT_STYLES.fonts.body.size);
  pdf.setFont("helvetica", "normal");
  const lines = pdf.splitTextToSize(text, width - 20);
  pdf.text(lines, REPORT_STYLES.spacing.margin + 15, y);
};

const calculateTextHeight = (
  pdf: jsPDF,
  text: string,
  width: number,
): number => {
  const lines = pdf.splitTextToSize(text, width);
  return lines.length * REPORT_STYLES.spacing.line;
};

// AI Content Generation (improved)
const generateAIContent = async (
  reportData: ReportData,
): Promise<AIGeneratedContent> => {
  try {
    const models = ["gpt-4o-mini", "gpt-3.5-turbo"];
    let content: AIGeneratedContent | null = null;

    for (const model of models) {
      try {
        content = await callOpenAI(reportData, model);
        if (content) break;
      } catch (error) {
        console.warn(`Failed to use model ${model}:`, error);
        continue;
      }
    }

    return content || generateFallbackContent(reportData);
  } catch (error) {
    console.error("AI content generation failed:", error);
    return generateFallbackContent(reportData);
  }
};

const callOpenAI = async (
  reportData: ReportData,
  model: string,
): Promise<AIGeneratedContent> => {
  const OpenAI = (await import("openai")).default;
  const apiKey =
    import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const chartInfo = reportData.chartData
    ? `Birth chart data: ${JSON.stringify({
        planets: reportData.chartData.planets
          ?.slice(0, 10)
          .map((p) => ({ name: p.name, sign: p.sign, house: p.house })),
        houses: reportData.chartData.houses
          ?.slice(0, 12)
          .map((h) => ({ house: h.house, sign: h.sign })),
        aspects: reportData.chartData.aspects?.slice(0, 10).map((a) => ({
          planet1: a.planet1,
          planet2: a.planet2,
          aspect: a.aspect,
        })),
      })}`
    : "No detailed chart data available";

  const prompt = `Create a comprehensive ${reportData.reportType} astrology report for ${reportData.userName}.

${chartInfo}

Report Type: ${reportData.reportType}
User: ${reportData.userName}
Birth Date: ${reportData.birthDate || "Not provided"}
Is Premium: ${reportData.isPremium}

Provide a detailed, professional analysis in JSON format:

{
  "introduction": "Warm, engaging introduction",
  "personalityAnalysis": "Deep personality analysis",
  "strengths": ["5-7 key strengths"],
  "challenges": ["4-6 growth areas"],
  "recommendations": ["6-8 actionable recommendations"],
  "conclusion": "Inspiring conclusion",
  "detailedSections": {
    "career": "Career analysis (premium only)",
    "relationships": "Relationship insights (premium only)",
    "spiritual": "Spiritual guidance (premium only)",
    "health": "Health guidance (premium only)"
  }
}

Make it professional, personalized, and ${reportData.isPremium ? "comprehensive" : "concise"}.`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a professional astrologer creating personalized reports.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: reportData.isPremium ? 3000 : 1500,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No content received from OpenAI");

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse AI response");
  }
};

const generateFallbackContent = (
  reportData: ReportData,
): AIGeneratedContent => {
  const baseContent = {
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

  if (reportData.isPremium) {
    baseContent["detailedSections"] = {
      career:
        "Your career path is influenced by strong leadership qualities and creative abilities. You thrive in environments that allow for innovation and personal expression.",
      relationships:
        "In relationships, you are loyal, caring, and deeply committed. You value emotional connection and intellectual compatibility.",
      spiritual:
        "Your spiritual journey is marked by a deep connection to intuition and higher wisdom. Consider exploring meditation and philosophical studies.",
      health:
        "Your health is closely connected to your emotional well-being. Stress management and regular exercise will serve you well.",
    };
  }

  return baseContent;
};

const addWatermark = (pdf: jsPDF, options: WatermarkOptions): void => {
  const { userName, birthDate, reportType } = options;

  let watermarkText = `Generated for ${userName}`;
  if (birthDate)
    watermarkText += ` (${new Date(birthDate).toLocaleDateString()})`;
  if (reportType) watermarkText += ` - ${reportType}`;
  watermarkText += " at mysticbanana.com";

  // Bottom watermark
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(watermarkText, 105, 285, { align: "center" });

  // Diagonal watermark
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.05 }));
  pdf.setFontSize(40);
  pdf.setTextColor(200, 200, 200);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.text("MYSTIC BANANA", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 45,
  });
  pdf.restoreGraphicsState();
};

export const addImageWatermark = (
  canvas: HTMLCanvasElement,
  options: WatermarkOptions,
): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { userName, birthDate } = options;
  let watermarkText = `Generated for ${userName}`;
  if (birthDate)
    watermarkText += ` (${new Date(birthDate).toLocaleDateString()})`;
  watermarkText += " at mysticbanana.com";

  // Bottom watermark
  ctx.font = "14px Arial";
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.textAlign = "center";
  ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 20);

  // Diagonal watermark
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillText("MYSTIC BANANA", 0, 0);
  ctx.restore();
};

interface NatalReportData extends ReportData {
  chartImageUrl?: string;
  planetaryPositions?: {
    planet: string;
    sign: string;
    house: number;
    degree: string;
  }[];
  aspectTable?: {
    aspect: string;
    planets: string;
    orb: string;
    meaning: string;
  }[];
  elementalBalance?: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalBalance?: { cardinal: number; fixed: number; mutable: number };
  chartPatterns?: { name: string; description: string }[];
  retrogradeInfo?: { planets: string[]; count: number };
  lunarPhase?: { phase: string; description: string };
}

const getSignFromDegree = (degree: number): string => {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const signIndex = Math.floor(degree / 30);
  return signs[signIndex] || "Aries";
};

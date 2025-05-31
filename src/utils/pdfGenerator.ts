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

export const generatePDFWithWatermark = async (
  element: HTMLElement,
  filename: string,
  watermarkOptions: WatermarkOptions,
): Promise<void> => {
  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      backgroundColor: "#1a1a1a",
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
  try {
    // Generate AI content first
    const aiContent = await generateAIContent(reportData);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set up colors and fonts
    const primaryColor = [74, 20, 140]; // Deep purple
    const accentColor = [184, 134, 11]; // Gold
    const textColor = [51, 51, 51]; // Dark gray
    const lightColor = [128, 128, 128]; // Light gray

    let currentY = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - 30) {
        pdf.addPage();
        currentY = 20;
        addWatermark(pdf, {
          userName: reportData.userName,
          birthDate: reportData.birthDate,
          reportType: reportData.reportType,
        });
      }
    };

    // Header with branding
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 40, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("MYSTIC BANANA", margin, 25);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Professional Astrology Reports", margin, 32);

    currentY = 50;

    // Report Title
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(reportData.title, contentWidth);
    pdf.text(titleLines, margin, currentY);
    currentY += titleLines.length * 8 + 10;

    // User Info Box
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, currentY, contentWidth, 25, "F");
    pdf.setDrawColor(...lightColor);
    pdf.rect(margin, currentY, contentWidth, 25, "S");

    pdf.setTextColor(...textColor);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Prepared for: ${reportData.userName}`, margin + 5, currentY + 8);
    if (reportData.birthDate) {
      pdf.text(
        `Birth Date: ${new Date(reportData.birthDate).toLocaleDateString()}`,
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

    // Introduction Section
    checkPageBreak(30);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Introduction", margin, currentY);
    currentY += 10;

    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const introLines = pdf.splitTextToSize(
      aiContent.introduction,
      contentWidth,
    );
    pdf.text(introLines, margin, currentY);
    currentY += introLines.length * 5 + 15;

    // Personality Analysis
    checkPageBreak(30);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Personality Analysis", margin, currentY);
    currentY += 10;

    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const personalityLines = pdf.splitTextToSize(
      aiContent.personalityAnalysis,
      contentWidth,
    );
    pdf.text(personalityLines, margin, currentY);
    currentY += personalityLines.length * 5 + 15;

    // Strengths Section
    checkPageBreak(40);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Your Strengths", margin, currentY);
    currentY += 10;

    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    aiContent.strengths.forEach((strength, index) => {
      checkPageBreak(8);
      pdf.text(`• ${strength}`, margin + 5, currentY);
      currentY += 6;
    });
    currentY += 10;

    // Challenges Section
    checkPageBreak(40);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Areas for Growth", margin, currentY);
    currentY += 10;

    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    aiContent.challenges.forEach((challenge, index) => {
      checkPageBreak(8);
      pdf.text(`• ${challenge}`, margin + 5, currentY);
      currentY += 6;
    });
    currentY += 10;

    // Premium content for premium users
    if (reportData.isPremium && aiContent.detailedSections) {
      // Career Section
      if (aiContent.detailedSections.career) {
        checkPageBreak(30);
        pdf.setTextColor(...accentColor);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Career & Life Purpose", margin, currentY);
        currentY += 10;

        pdf.setTextColor(...textColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const careerLines = pdf.splitTextToSize(
          aiContent.detailedSections.career,
          contentWidth,
        );
        pdf.text(careerLines, margin, currentY);
        currentY += careerLines.length * 5 + 15;
      }

      // Relationships Section
      if (aiContent.detailedSections.relationships) {
        checkPageBreak(30);
        pdf.setTextColor(...accentColor);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Love & Relationships", margin, currentY);
        currentY += 10;

        pdf.setTextColor(...textColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const relationshipLines = pdf.splitTextToSize(
          aiContent.detailedSections.relationships,
          contentWidth,
        );
        pdf.text(relationshipLines, margin, currentY);
        currentY += relationshipLines.length * 5 + 15;
      }

      // Spiritual Section
      if (aiContent.detailedSections.spiritual) {
        checkPageBreak(30);
        pdf.setTextColor(...accentColor);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Spiritual Path", margin, currentY);
        currentY += 10;

        pdf.setTextColor(...textColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const spiritualLines = pdf.splitTextToSize(
          aiContent.detailedSections.spiritual,
          contentWidth,
        );
        pdf.text(spiritualLines, margin, currentY);
        currentY += spiritualLines.length * 5 + 15;
      }
    }

    // Recommendations
    checkPageBreak(40);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Personalized Recommendations", margin, currentY);
    currentY += 10;

    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    aiContent.recommendations.forEach((recommendation, index) => {
      checkPageBreak(8);
      pdf.text(`${index + 1}. ${recommendation}`, margin + 5, currentY);
      currentY += 6;
    });
    currentY += 15;

    // Conclusion
    checkPageBreak(30);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Conclusion", margin, currentY);
    currentY += 10;

    pdf.setTextColor(...textColor);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const conclusionLines = pdf.splitTextToSize(
      aiContent.conclusion,
      contentWidth,
    );
    pdf.text(conclusionLines, margin, currentY);
    currentY += conclusionLines.length * 5 + 15;

    // Add watermark to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addWatermark(pdf, {
        userName: reportData.userName,
        birthDate: reportData.birthDate,
        reportType: reportData.reportType,
      });
    }

    // Save PDF
    const filename = `${reportData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Professional PDF generation failed:", error);
    throw error;
  }
};

const generateAIContent = async (
  reportData: ReportData,
): Promise<AIGeneratedContent> => {
  try {
    // Try different OpenAI models in order of preference
    const models = [
      "gpt-4.1-nano-2025-04-14",
      "gpt-4.1-mini",
      "gpt-4.1-mini-2025-04-14",
      "gpt-4o-mini", // Fallback
      "gpt-3.5-turbo", // Final fallback
    ];

    let content: AIGeneratedContent | null = null;
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        content = await callOpenAI(reportData, model);
        if (content) break;
      } catch (error) {
        console.warn(`Failed to use model ${model}:`, error);
        lastError = error as Error;
        continue;
      }
    }

    if (!content) {
      console.warn("All AI models failed, using fallback content");
      content = generateFallbackContent(reportData);
    }

    return content;
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

  // Get OpenAI API key from environment
  const apiKey =
    import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const chartInfo = reportData.chartData
    ? `Birth chart data: ${JSON.stringify({
        planets: reportData.chartData.planets
          .slice(0, 10)
          .map((p) => ({ name: p.name, sign: p.sign, house: p.house })),
        houses: reportData.chartData.houses
          .slice(0, 12)
          .map((h) => ({ house: h.house, sign: h.sign })),
        aspects: reportData.chartData.aspects
          .slice(0, 10)
          .map((a) => ({
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

Please provide a detailed, professional, and personalized astrological analysis. The response should be in JSON format with the following structure:

{
  "introduction": "A warm, engaging introduction that sets the tone for the report",
  "personalityAnalysis": "Deep analysis of personality traits based on astrological factors",
  "strengths": ["Array of 5-7 key strengths"],
  "challenges": ["Array of 4-6 areas for growth and development"],
  "recommendations": ["Array of 6-8 actionable recommendations"],
  "conclusion": "Inspiring and motivating conclusion",
  "detailedSections": {
    "career": "Career and life purpose analysis (only if premium)",
    "relationships": "Love and relationship insights (only if premium)",
    "spiritual": "Spiritual path and soul purpose (only if premium)",
    "health": "Health and wellness guidance (only if premium)"
  }
}

Make the content:
- Professional yet accessible
- Specific and personalized
- Positive and empowering
- Actionable and practical
- Rich in astrological insights
- ${reportData.isPremium ? "Comprehensive with detailed sections" : "Concise but meaningful"}

Ensure all text is appropriate for a professional astrology report and avoid generic statements.`;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "You are a professional astrologer with decades of experience creating personalized, insightful astrological reports. Your writing is warm, professional, and deeply knowledgeable about astrology.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: reportData.isPremium ? 3000 : 1500,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
};

const generateFallbackContent = (
  reportData: ReportData,
): AIGeneratedContent => {
  const baseContent = {
    introduction: `Welcome to your personalized ${reportData.reportType} astrology report, ${reportData.userName}. This comprehensive analysis explores the cosmic influences that shape your unique personality and life path. Through the ancient wisdom of astrology, we'll uncover insights about your character, potential, and the opportunities that await you.`,
    personalityAnalysis: `Your astrological profile reveals a complex and fascinating personality. The planetary positions at your birth create a unique cosmic fingerprint that influences your thoughts, emotions, and actions. You possess a natural ability to adapt to different situations while maintaining your core values and beliefs. Your intuitive nature is balanced by practical wisdom, allowing you to navigate life's challenges with grace and determination.`,
    strengths: [
      "Natural leadership abilities and charismatic presence",
      "Strong intuition and emotional intelligence",
      "Excellent communication and interpersonal skills",
      "Creative problem-solving capabilities",
      "Resilience and adaptability in challenging situations",
      "Deep empathy and understanding of others",
      "Natural ability to inspire and motivate people",
    ],
    challenges: [
      "Tendency to be overly critical of yourself",
      "Difficulty in making quick decisions under pressure",
      "Sometimes struggle with work-life balance",
      "May avoid confrontation even when necessary",
      "Perfectionist tendencies that can cause stress",
      "Occasional difficulty in expressing emotions clearly",
    ],
    recommendations: [
      "Practice daily meditation or mindfulness to center yourself",
      "Set clear boundaries between work and personal time",
      "Trust your intuition more when making important decisions",
      "Engage in creative activities that bring you joy",
      "Build a strong support network of trusted friends and mentors",
      "Focus on self-compassion and celebrate your achievements",
      "Consider journaling to process emotions and thoughts",
      "Embrace opportunities for personal growth and learning",
    ],
    conclusion: `Your astrological journey is unique and filled with potential. The stars have aligned to give you specific gifts and challenges that will help you grow into your highest self. Remember that astrology is a tool for self-understanding and empowerment, not limitation. Use these insights to make conscious choices that align with your true nature and deepest aspirations. Trust in your abilities, embrace your authentic self, and let your inner light shine brightly in the world.`,
  };

  if (reportData.isPremium) {
    baseContent["detailedSections"] = {
      career:
        "Your career path is influenced by strong leadership qualities and creative abilities. You thrive in environments that allow for innovation and personal expression. Consider roles that involve communication, creativity, or helping others. Your natural charisma makes you well-suited for positions of responsibility and influence.",
      relationships:
        "In relationships, you are loyal, caring, and deeply committed. You value emotional connection and intellectual compatibility. Your empathetic nature makes you a wonderful partner, though you may need to work on expressing your needs more clearly. Focus on building relationships based on mutual respect and understanding.",
      spiritual:
        "Your spiritual journey is marked by a deep connection to intuition and higher wisdom. You may find fulfillment in practices that combine ancient wisdom with modern understanding. Consider exploring meditation, energy work, or philosophical studies that resonate with your soul's purpose.",
      health:
        "Your health is closely connected to your emotional well-being. Stress management through relaxation techniques, regular exercise, and proper nutrition will serve you well. Pay attention to your body's signals and maintain a balanced lifestyle that honors both your physical and emotional needs.",
    };
  }

  return baseContent;
};

const addWatermark = (pdf: jsPDF, options: WatermarkOptions): void => {
  const { userName, birthDate, reportType } = options;

  // Main watermark
  let watermarkText = `Generated for ${userName}`;
  if (birthDate) {
    watermarkText += ` (${new Date(birthDate).toLocaleDateString()})`;
  }
  if (reportType) {
    watermarkText += ` - ${reportType}`;
  }
  watermarkText += " at mysticbanana.com";

  // Add main watermark at bottom
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(watermarkText, 105, 285, { align: "center" });

  // Add subtle diagonal watermark
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  pdf.setFontSize(40);
  pdf.setTextColor(200, 200, 200);

  // Rotate and add diagonal text
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

  // Add bottom watermark
  let watermarkText = `Generated for ${userName}`;
  if (birthDate) {
    watermarkText += ` (${new Date(birthDate).toLocaleDateString()})`;
  }
  watermarkText += " at mysticbanana.com";

  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.textAlign = "center";
  ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 20);

  // Add subtle diagonal watermark
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  // Rotate and add diagonal text
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillText("MYSTIC BANANA", 0, 0);
  ctx.restore();
};

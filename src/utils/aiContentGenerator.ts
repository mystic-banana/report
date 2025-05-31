import { BirthChartData } from "./astronomicalCalculations";

interface AIContentRequest {
  reportType: string;
  userName: string;
  birthDate?: string;
  chartData?: BirthChartData;
  isPremium: boolean;
}

export const generateAIReportContent = async (
  request: AIContentRequest,
): Promise<string> => {
  try {
    // Try different OpenAI models in order of preference
    const models = [
      "gpt-4.1-nano-2025-04-14",
      "gpt-4.1-mini",
      "gpt-4.1-mini-2025-04-14",
      "gpt-4o-mini", // Fallback
      "gpt-3.5-turbo", // Final fallback
    ];

    let content: string | null = null;
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        content = await callOpenAIForContent(request, model);
        if (content) break;
      } catch (error) {
        console.warn(`Failed to use model ${model}:`, error);
        lastError = error as Error;
        continue;
      }
    }

    if (!content) {
      console.warn("All AI models failed, using fallback content");
      content = generateFallbackReportContent(request);
    }

    return content;
  } catch (error) {
    console.error("AI content generation failed:", error);
    return generateFallbackReportContent(request);
  }
};

const callOpenAIForContent = async (
  request: AIContentRequest,
  model: string,
): Promise<string> => {
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

  const chartInfo = request.chartData
    ? `Birth chart data: ${JSON.stringify({
        planets: request.chartData.planets
          .slice(0, 10)
          .map((p) => ({ name: p.name, sign: p.sign, house: p.house })),
        houses: request.chartData.houses
          .slice(0, 12)
          .map((h) => ({ house: h.house, sign: h.sign })),
        aspects: request.chartData.aspects
          .slice(0, 10)
          .map((a) => ({
            planet1: a.planet1,
            planet2: a.planet2,
            aspect: a.aspect,
          })),
      })}`
    : "No detailed chart data available";

  const prompt = `Create a comprehensive ${request.reportType} astrology report for ${request.userName}.

${chartInfo}

Report Type: ${request.reportType}
User: ${request.userName}
Birth Date: ${request.birthDate || "Not provided"}
Is Premium: ${request.isPremium}

Please provide a detailed, professional, and personalized astrological analysis. Make the content:
- Professional yet accessible
- Specific and personalized based on the chart data
- Positive and empowering
- Actionable and practical
- Rich in astrological insights
- ${request.isPremium ? "Comprehensive (800-1200 words)" : "Concise but meaningful (400-600 words)"}

Structure the report with clear sections covering:
1. Introduction
2. Personality Analysis
3. Key Strengths
4. Areas for Growth
5. ${request.isPremium ? "Detailed life area analysis (career, relationships, etc.)" : "General guidance"}
6. Personalized Recommendations
7. Conclusion

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
    max_tokens: request.isPremium ? 2000 : 1000,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  return content;
};

const generateFallbackReportContent = (request: AIContentRequest): string => {
  const { reportType, userName, isPremium } = request;

  const baseContent = `
**${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Astrology Report for ${userName}**

**Introduction**
Welcome to your personalized ${reportType} astrology report, ${userName}. This comprehensive analysis explores the cosmic influences that shape your unique personality and life path. Through the ancient wisdom of astrology, we'll uncover insights about your character, potential, and the opportunities that await you.

**Personality Analysis**
Your astrological profile reveals a complex and fascinating personality. The planetary positions at your birth create a unique cosmic fingerprint that influences your thoughts, emotions, and actions. You possess a natural ability to adapt to different situations while maintaining your core values and beliefs. Your intuitive nature is balanced by practical wisdom, allowing you to navigate life's challenges with grace and determination.

**Key Strengths**
• Natural leadership abilities and charismatic presence
• Strong intuition and emotional intelligence
• Excellent communication and interpersonal skills
• Creative problem-solving capabilities
• Resilience and adaptability in challenging situations
• Deep empathy and understanding of others

**Areas for Growth**
• Tendency to be overly critical of yourself
• Difficulty in making quick decisions under pressure
• Sometimes struggle with work-life balance
• May avoid confrontation even when necessary
• Perfectionist tendencies that can cause stress

${
  isPremium
    ? `
**Career & Life Purpose**
Your career path is influenced by strong leadership qualities and creative abilities. You thrive in environments that allow for innovation and personal expression. Consider roles that involve communication, creativity, or helping others. Your natural charisma makes you well-suited for positions of responsibility and influence.

**Love & Relationships**
In relationships, you are loyal, caring, and deeply committed. You value emotional connection and intellectual compatibility. Your empathetic nature makes you a wonderful partner, though you may need to work on expressing your needs more clearly. Focus on building relationships based on mutual respect and understanding.

**Spiritual Path**
Your spiritual journey is marked by a deep connection to intuition and higher wisdom. You may find fulfillment in practices that combine ancient wisdom with modern understanding. Consider exploring meditation, energy work, or philosophical studies that resonate with your soul's purpose.
`
    : ""
}

**Personalized Recommendations**
1. Practice daily meditation or mindfulness to center yourself
2. Set clear boundaries between work and personal time
3. Trust your intuition more when making important decisions
4. Engage in creative activities that bring you joy
5. Build a strong support network of trusted friends and mentors
6. Focus on self-compassion and celebrate your achievements
7. Consider journaling to process emotions and thoughts
8. Embrace opportunities for personal growth and learning

**Conclusion**
Your astrological journey is unique and filled with potential. The stars have aligned to give you specific gifts and challenges that will help you grow into your highest self. Remember that astrology is a tool for self-understanding and empowerment, not limitation. Use these insights to make conscious choices that align with your true nature and deepest aspirations. Trust in your abilities, embrace your authentic self, and let your inner light shine brightly in the world.

---
*This report was generated with care and attention to your unique astrological profile. May it serve as a guide on your journey of self-discovery and personal growth.*
  `;

  return baseContent.trim();
};

export const generateAIHoroscopes = async (
  signs: string[],
  date: string,
): Promise<any[]> => {
  try {
    const OpenAI = (await import("openai")).default;

    const apiKey =
      import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    const prompt = `Generate daily horoscopes for all 12 zodiac signs for ${date}. 

For each sign, provide:
- A meaningful, personalized horoscope (2-3 sentences)
- Love score (70-100)
- Career score (70-100) 
- Health score (70-100)
- 3 lucky numbers (1-50)
- 2 lucky colors

Make each horoscope unique, positive, and actionable. Focus on the specific traits and themes of each sign.

Return as JSON array with this structure:
[{
  "zodiac_sign": "Aries",
  "content": "horoscope text",
  "love_score": 85,
  "career_score": 78,
  "health_score": 92,
  "lucky_numbers": [7, 23, 41],
  "lucky_colors": ["Red", "Orange"]
}, ...]

Signs to include: ${signs.join(", ")}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional astrologer creating daily horoscopes. Your horoscopes are insightful, positive, and specific to each zodiac sign's characteristics.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    try {
      const horoscopes = JSON.parse(content);
      return horoscopes.map((h: any) => ({
        ...h,
        date,
        ai_generated: true,
      }));
    } catch (parseError) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const horoscopes = JSON.parse(jsonMatch[0]);
        return horoscopes.map((h: any) => ({
          ...h,
          date,
          ai_generated: true,
        }));
      }
      throw new Error("Failed to parse AI horoscope response as JSON");
    }
  } catch (error) {
    console.error("AI horoscope generation failed:", error);
    throw error;
  }
};

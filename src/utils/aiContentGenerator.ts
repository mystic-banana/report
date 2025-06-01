import {
  BirthChartData,
  PlanetaryPosition,
  AspectData,
  ChartPattern,
} from "./astronomicalCalculations";

interface AIContentRequest {
  reportType: string;
  userName: string;
  birthDate?: string;
  chartData?: BirthChartData;
  isPremium: boolean;
}

interface NatalChartContent {
  introduction: string;
  personalityAnalysis: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  conclusion: string;
  // Premium content
  planetaryInterpretations?: { [planet: string]: string };
  houseInterpretations?: { [house: string]: string };
  aspectInterpretations?: { [aspect: string]: string };
  elementalAnalysis?: string;
  modalAnalysis?: string;
  chartPatterns?: string;
  retrogradeAnalysis?: string;
  lunarPhaseAnalysis?: string;
  chironAnalysis?: string;
  nodesAnalysis?: string;
  partOfFortuneAnalysis?: string;
  careerGuidance?: string;
  relationshipGuidance?: string;
  spiritualGuidance?: string;
  lifeThemes?: string;
}

export const generateAIReportContent = async (
  request: AIContentRequest,
): Promise<string> => {
  try {
    // For natal chart reports, use enhanced generation
    if (
      request.reportType === "natal" ||
      request.reportType === "birth-chart"
    ) {
      return await generateNatalChartContent(request);
    }

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

/**
 * Generate comprehensive natal chart content using PICA API
 */
export const generateNatalChartContent = async (
  request: AIContentRequest,
): Promise<string> => {
  try {
    const content = await generateNatalChartSections(request);
    return formatNatalChartReport(content, request.isPremium);
  } catch (error) {
    console.error("Natal chart generation failed:", error);
    return generateFallbackNatalContent(request);
  }
};

/**
 * Generate natal chart sections using PICA API
 */
const generateNatalChartSections = async (
  request: AIContentRequest,
): Promise<NatalChartContent> => {
  const { chartData, userName, isPremium } = request;

  if (!chartData) {
    return generateFallbackNatalSections(request);
  }

  const sun = chartData.planets.find((p) => p.name === "Sun");
  const moon = chartData.planets.find((p) => p.name === "Moon");
  const ascendant = chartData.ascendant;
  const ascendantSign = getSignFromDegree(ascendant);

  try {
    // Use PICA API for enhanced natal chart interpretations
    const sections = await Promise.all([
      generateSectionWithPICA("introduction", {
        sun: sun ? `${sun.sign} in ${sun.house}th house` : "Unknown",
        moon: moon ? `${moon.sign} in ${moon.house}th house` : "Unknown",
        ascendant: ascendantSign,
        userName,
      }),
      generateSectionWithPICA("personality", {
        planets: chartData.planets
          .slice(0, 5)
          .map((p) => `${p.name} in ${p.sign} in ${p.house}th house`)
          .join(", "),
        userName,
      }),
      generateSectionWithPICA("strengths", {
        chartData: JSON.stringify({
          planets: chartData.planets.slice(0, 8),
          aspects: chartData.aspects
            .filter((a) => a.nature === "harmonious")
            .slice(0, 5),
        }),
        userName,
      }),
      generateSectionWithPICA("challenges", {
        aspects: chartData.aspects
          .filter((a) => a.nature === "challenging")
          .slice(0, 5),
        userName,
      }),
      generateSectionWithPICA("recommendations", {
        chartData: JSON.stringify({
          elementalBalance: chartData.elementalBalance,
          modalBalance: chartData.modalBalance,
          retrograde: chartData.retrogradeInfo,
        }),
        userName,
      }),
      generateSectionWithPICA("conclusion", {
        sun: sun?.sign,
        moon: moon?.sign,
        ascendant: ascendantSign,
        userName,
      }),
    ]);

    const content: NatalChartContent = {
      introduction: sections[0],
      personalityAnalysis: sections[1],
      strengths: sections[2]
        .split("\n")
        .filter((s) => s.trim().startsWith("•"))
        .map((s) => s.replace("•", "").trim()),
      challenges: sections[3]
        .split("\n")
        .filter((s) => s.trim().startsWith("•"))
        .map((s) => s.replace("•", "").trim()),
      recommendations: sections[4]
        .split("\n")
        .filter((s) => s.trim().match(/^\d+\./))
        .map((s) => s.replace(/^\d+\./, "").trim()),
      conclusion: sections[5],
    };

    // Generate premium content if needed
    if (isPremium) {
      const premiumSections = await generatePremiumNatalSections(
        request,
        chartData,
      );
      Object.assign(content, premiumSections);
    }

    return content;
  } catch (error) {
    console.error("PICA API failed, using fallback:", error);
    return generateFallbackNatalSections(request);
  }
};

/**
 * Generate section using PICA API
 */
const generateSectionWithPICA = async (
  sectionType: string,
  data: any,
): Promise<string> => {
  const prompts = {
    introduction: `Write a 100–120 word introduction for a natal chart report. Summarize the user's cosmic makeup based on the Sun in ${data.sun}, Moon in ${data.moon}, and Ascendant in ${data.ascendant}. Describe the general tone of their life path in poetic, inspiring language. Avoid jargon.`,

    personality: `Interpret the personality by synthesizing the following placements: ${data.planets}. Weave these into one cohesive description of their core character, emotional needs, communication style, and how they relate to others. Keep it under 300 words. Focus on self-worth, relationships, and self-expression.`,

    strengths: `Based on the chart data (${data.chartData}), list 6–8 core strengths. Use bullet points. For each, give a short explanation (1–2 lines) focused on emotional resilience, creativity, leadership, empathy, and communication.`,

    challenges: `Identify 5–7 areas for personal growth based on the following challenging aspects: ${JSON.stringify(data.aspects)}. Use gentle language. Focus on emotional regulation, balance, spiritual development, and relationship awareness. Phrase as "growth opportunities" rather than flaws.`,

    recommendations: `Give 6–8 personalized spiritual and psychological recommendations based on the user's chart data: ${data.chartData}. Include suggestions such as journaling, creative expression, emotional grounding, boundary-setting, or spiritual study. Format as a numbered list.`,

    conclusion: `Write a 100-word uplifting conclusion that affirms the user's potential. Encourage them to embrace both their strengths and challenges as part of their spiritual journey. Mention self-love, creative expression, and transformation as central themes based on ${data.sun} Sun, ${data.moon} Moon, ${data.ascendant} Ascendant.`,
  };

  const prompt =
    prompts[sectionType] || `Generate ${sectionType} content for natal chart.`;

  try {
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret":
            import.meta.env.VITE_PICA_SECRET_KEY || process.env.PICA_SECRET_KEY,
          "x-pica-connection-key":
            "live::openai::default::516d4faffd9b454aab0fdd853fa26304|7ed2fb4a-d7cf-4d64-a380-5fb5dc475b34",
          "x-pica-action-id":
            "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a professional astrologer and spiritual guide. Interpret natal chart data using Western astrology (Placidus houses, planetary aspects, nodes, and Chiron). Use a clear, beginner-friendly tone with spiritual, poetic insights. Prioritize personal empowerment, emotional intelligence, and psychological growth. Make interpretations feel personalized, not generic. Avoid technical jargon unless explained. Make each section cohesive and emotionally resonant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const result = await response.json();
    return result.choices[0]?.message?.content || "Content generation failed";
  } catch (error) {
    console.error("PICA API call failed:", error);
    throw error;
  }
};

/**
 * Generate premium natal chart sections
 */
const generatePremiumNatalSections = async (
  request: AIContentRequest,
  chartData: BirthChartData,
): Promise<Partial<NatalChartContent>> => {
  const premiumContent: Partial<NatalChartContent> = {};

  try {
    // Generate planetary interpretations
    const planetaryInterpretations: { [planet: string]: string } = {};
    for (const planet of chartData.planets.slice(0, 10)) {
      try {
        planetaryInterpretations[planet.name] = await generateSectionWithPICA(
          "planet",
          {
            planet: planet.name,
            sign: planet.sign,
            house: planet.house,
            isRetrograde: planet.speed < 0,
          },
        );
      } catch (error) {
        planetaryInterpretations[planet.name] =
          `${planet.name} in ${planet.sign} in the ${planet.house}th house brings unique energy to your chart.`;
      }
    }
    premiumContent.planetaryInterpretations = planetaryInterpretations;

    // Generate house interpretations
    const houseInterpretations: { [house: string]: string } = {};
    for (const house of chartData.houses) {
      try {
        houseInterpretations[`House ${house.house}`] =
          await generateSectionWithPICA("house", {
            house: house.house,
            sign: house.sign,
            degree: house.degree,
          });
      } catch (error) {
        houseInterpretations[`House ${house.house}`] =
          `The ${house.house}th house in ${house.sign} influences this area of your life.`;
      }
    }
    premiumContent.houseInterpretations = houseInterpretations;

    // Generate other premium sections
    if (chartData.elementalBalance) {
      premiumContent.elementalAnalysis = await generateSectionWithPICA(
        "elemental",
        {
          balance: chartData.elementalBalance,
        },
      ).catch(
        () =>
          "Your elemental balance reveals unique patterns in your personality.",
      );
    }

    if (chartData.lunarPhase) {
      premiumContent.lunarPhaseAnalysis = await generateSectionWithPICA(
        "lunar",
        {
          phase: chartData.lunarPhase.phase,
          description: chartData.lunarPhase.description,
        },
      ).catch(
        () =>
          `Born under the ${chartData.lunarPhase.phase}, you carry its energy throughout life.`,
      );
    }

    if (chartData.chiron) {
      premiumContent.chironAnalysis = await generateSectionWithPICA("chiron", {
        sign: chartData.chiron.sign,
        house: chartData.chiron.house,
      }).catch(
        () =>
          `Chiron in ${chartData.chiron.sign} reveals your path to healing and wisdom.`,
      );
    }
  } catch (error) {
    console.error("Premium content generation failed:", error);
  }

  return premiumContent;
};

/**
 * Get zodiac sign from degree
 */
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

/**
 * Format natal chart report
 */
const formatNatalChartReport = (
  content: NatalChartContent,
  isPremium: boolean,
): string => {
  let report = `**Natal Chart Report**

`;

  report += `**Introduction**
${content.introduction}

`;
  report += `**Personality Analysis**
${content.personalityAnalysis}

`;

  report += `**Key Strengths**
`;
  content.strengths.forEach((strength, index) => {
    report += `${index + 1}. ${strength}
`;
  });
  report += `
`;

  report += `**Areas for Growth**
`;
  content.challenges.forEach((challenge, index) => {
    report += `${index + 1}. ${challenge}
`;
  });
  report += `
`;

  if (isPremium && content.planetaryInterpretations) {
    report += `**Planetary Interpretations**
`;
    Object.entries(content.planetaryInterpretations).forEach(
      ([planet, interpretation]) => {
        report += `**${planet}**: ${interpretation}

`;
      },
    );
  }

  if (isPremium && content.houseInterpretations) {
    report += `**House Interpretations**
`;
    Object.entries(content.houseInterpretations).forEach(
      ([house, interpretation]) => {
        report += `**${house}**: ${interpretation}

`;
      },
    );
  }

  if (isPremium && content.elementalAnalysis) {
    report += `**Elemental Balance**
${content.elementalAnalysis}

`;
  }

  if (isPremium && content.lunarPhaseAnalysis) {
    report += `**Lunar Phase at Birth**
${content.lunarPhaseAnalysis}

`;
  }

  if (isPremium && content.chironAnalysis) {
    report += `**Chiron: The Wounded Healer**
${content.chironAnalysis}

`;
  }

  report += `**Personalized Recommendations**
`;
  content.recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}
`;
  });
  report += `
`;

  report += `**Conclusion**
${content.conclusion}

`;

  return report;
};

/**
 * Generate fallback natal chart sections
 */
const generateFallbackNatalSections = (
  request: AIContentRequest,
): NatalChartContent => {
  const { userName, chartData } = request;

  return {
    introduction: `Welcome to your personalized natal chart report, ${userName}. Your birth chart is a cosmic blueprint that reveals the unique energies present at the moment of your birth. This celestial map offers profound insights into your personality, potential, and life path.`,

    personalityAnalysis: `Your astrological profile reveals a complex and multifaceted personality. The planetary positions in your chart create a unique cosmic signature that influences your thoughts, emotions, and actions. You possess natural abilities that, when understood and developed, can lead to profound personal growth and fulfillment.`,

    strengths: [
      "Natural leadership abilities and inspiring presence",
      "Strong intuition and emotional intelligence",
      "Excellent communication and interpersonal skills",
      "Creative problem-solving capabilities",
      "Resilience and adaptability in challenging situations",
      "Deep empathy and understanding of others",
      "Natural ability to inspire and motivate people",
      "Strong sense of purpose and direction",
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

    conclusion: `Your natal chart reveals a soul with tremendous potential for growth, creativity, and positive impact. The cosmic energies present at your birth have gifted you with unique talents and perspectives. Embrace both your strengths and challenges as part of your spiritual journey, knowing that each aspect of your chart contributes to your authentic self.`,
  };
};

/**
 * Generate fallback natal content
 */
const generateFallbackNatalContent = (request: AIContentRequest): string => {
  const content = generateFallbackNatalSections(request);
  return formatNatalChartReport(content, request.isPremium);
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
        aspects: request.chartData.aspects.slice(0, 10).map((a) => ({
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

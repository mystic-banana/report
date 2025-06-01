const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { birthData, chartData, isPremium, reportType } = await req.json();

    // Validate required data
    if (!birthData || !chartData) {
      return new Response(
        JSON.stringify({ error: "Birth data and chart data are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare comprehensive Vedic astrology prompt
    const systemPrompt = `You are an expert Vedic astrologer and software developer. Generate detailed, professional, and accurate Vedic astrology report sections based on user birth details and chart data. 

Include these core sections:
1. Janma Kundali (Birth Chart) - Lagna chart, Navamsa chart, planetary positions with degrees, retrograde status, combustion, exaltation/debilitation
2. Bhava (House) Analysis - Lagna analysis, interpretation of each house with its ruler and planets
3. Graha (Planet) Analysis - Natural and functional significations, strength analysis
4. Vimshottari Dasha Periods - Maha Dasha and Antar Dasha timelines with interpretations
5. Nakshatra (Lunar Mansion) Insights - Birth nakshatra, pada, personality traits
6. Yogas and Doshas - Important yogas (Raj Yoga, Dhana Yoga, etc.) and malefic doshas
7. Planetary Strength and Ashtakavarga - Shadbala chart, Ashtakavarga points
8. Transits (Gochar) - Effects of major transiting planets, Sade Sati report
9. Remedies and Spiritual Guidance - Mantras, gemstones, yantras, personalized recommendations

Provide ${isPremium ? "comprehensive detailed analysis with all sections" : "basic analysis focusing on key insights"}.

Format the output as JSON with clear section keys. Make interpretations personal, accurate, and spiritually meaningful.`;

    const userPrompt = `Generate a comprehensive Vedic astrology report for:

Name: ${birthData.name}
Birth Date: ${birthData.birthDate}
Birth Time: ${birthData.birthTime || "Not provided"}
Birth Location: ${birthData.location?.city}, ${birthData.location?.country}

Chart Data Summary:
- Planets: ${JSON.stringify(chartData.planets?.slice(0, 10).map((p) => ({ name: p.name, sign: p.sign, house: p.house, degree: p.degree })))}
- Houses: ${JSON.stringify(chartData.houses?.slice(0, 12).map((h) => ({ house: h.house, sign: h.sign })))}
- Major Aspects: ${JSON.stringify(chartData.aspects?.slice(0, 8).map((a) => ({ planet1: a.planet1, planet2: a.planet2, aspect: a.aspect })))}

Report Type: ${reportType || "vedic"}
User Tier: ${isPremium ? "Premium" : "Free"}

Generate a detailed Vedic astrology report with all the core sections mentioned. Include practical guidance and spiritual insights.`;

    // Try OpenAI API first, then fallback to mock content
    let content = "";

    try {
      // Try OpenAI API
      const openaiKey =
        Deno.env.get("VITE_OPENAI_API_KEY") || Deno.env.get("OPENAI_API_KEY");

      if (openaiKey) {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              max_tokens: isPremium ? 3000 : 1500,
              temperature: 0.7,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `PICA API error: ${response.status} ${response.statusText}`,
          );
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("No content received from AI service");
        }
      }
    } catch (error) {
      console.warn("OpenAI API failed, using fallback content:", error);
    }

    // Fallback to comprehensive mock content if API fails
    if (!content) {
      content = generateFallbackVedicContent(birthData, isPremium);
    }

    // Try to parse as JSON, fallback to structured text
    let vedicReport;
    try {
      vedicReport = JSON.parse(content);
    } catch (parseError) {
      // If not valid JSON, create structured response
      vedicReport = {
        introduction: content.substring(0, 500) + "...",
        janmaKundali:
          "Detailed birth chart analysis based on Vedic principles.",
        bhavaAnalysis: "Comprehensive house-wise analysis of life areas.",
        grahaAnalysis: "Planetary analysis with strengths and significations.",
        dashaAnalysis: "Vimshottari Dasha periods and their effects.",
        nakshatraInsights: "Birth star analysis and personality traits.",
        yogasAndDoshas: "Important planetary combinations and their effects.",
        remedies: "Personalized spiritual and practical remedies.",
        conclusion: "Summary of key insights and guidance.",
        fullContent: content,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: vedicReport,
        isPremium,
        generatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Vedic report generation error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate Vedic report",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Fallback Vedic content generator
function generateFallbackVedicContent(
  birthData: any,
  isPremium: boolean,
): string {
  const vedicReport = {
    introduction: `Welcome to your comprehensive Vedic astrology report, ${birthData.name}. This ancient system of Jyotish reveals the deeper karmic patterns and spiritual purpose of your life based on the sidereal zodiac and traditional Indian astrological principles.`,

    janmaKundali: `Your Janma Kundali (birth chart) is the foundation of Vedic astrology. Based on your birth details - ${new Date(birthData.birthDate).toLocaleDateString()} in ${birthData.location?.city}, ${birthData.location?.country} - your chart reveals the precise planetary positions at the moment of your birth. The Lagna (Ascendant) represents your physical body and overall personality, while the placement of planets in various houses indicates different life areas and their influences.`,

    bhavaAnalysis: `The twelve Bhavas (houses) in your chart represent different aspects of life. Your Lagna Bhava shows your personality and physical constitution. The second house governs wealth and speech, the third house represents siblings and courage, the fourth house indicates home and mother, the fifth house shows children and creativity, the sixth house represents health and enemies, the seventh house governs marriage and partnerships, the eighth house indicates longevity and transformation, the ninth house shows dharma and fortune, the tenth house represents career and status, the eleventh house governs gains and friendships, and the twelfth house indicates spirituality and liberation.`,

    grahaAnalysis: `The nine Grahas (planets) in Vedic astrology each have specific significations. The Sun represents your soul and father, the Moon governs mind and mother, Mars indicates energy and siblings, Mercury represents intelligence and communication, Jupiter shows wisdom and spirituality, Venus governs love and luxury, Saturn indicates discipline and challenges, Rahu represents desires and illusions, and Ketu shows spirituality and detachment. Each planet's placement in your chart reveals its influence on your life.`,

    nakshatraInsights: `Your birth Nakshatra (lunar mansion) is determined by the Moon's position at birth. There are 27 Nakshatras, each spanning 13°20' of the zodiac. Your birth Nakshatra reveals your inherent nature, personality traits, and spiritual inclinations. The ruling deity and symbol of your Nakshatra provide deeper insights into your character and life purpose. The Pada (quarter) within the Nakshatra further refines these interpretations.`,

    dashaAnalysis: isPremium
      ? `The Vimshottari Dasha system is a unique timing technique in Vedic astrology. Your current Mahadasha (major period) and Antardasha (sub-period) indicate the planetary influences active in your life. Each planet rules for a specific number of years, bringing its significations to the forefront. Understanding your Dasha periods helps in timing important life events and making informed decisions. The current planetary period influences your experiences, opportunities, and challenges.`
      : `Your current Dasha period indicates the primary planetary influence in your life. This timing system helps understand the cyclical nature of experiences and opportunities.`,

    yogasAndDoshas: isPremium
      ? `Yogas are special planetary combinations that create specific results. Raj Yogas indicate royal status and success, Dhana Yogas show wealth potential, and various other Yogas reveal different life themes. Doshas are challenging combinations that require attention. Manglik Dosha affects marriage compatibility, Kaal Sarp Dosha creates obstacles, and other Doshas indicate areas needing remedial measures. Understanding these combinations helps in maximizing positive influences and mitigating challenges.`
      : `Your chart contains various planetary combinations (Yogas) that influence different life areas. Some combinations are beneficial while others may require attention and remedial measures.`,

    planetaryStrengths: isPremium
      ? `Planetary strength analysis through Shadbala calculations reveals which planets are strong or weak in your chart. Strong planets deliver positive results while weak planets may create challenges. Ashtakavarga system provides numerical strength for each planet and house, helping identify favorable and challenging life areas. This analysis guides in understanding which planetary periods will be more beneficial and which may require extra effort.`
      : `The strength of planets in your chart varies, with some being more influential than others in shaping your life experiences.`,

    transits: isPremium
      ? `Current planetary transits (Gochar) show how moving planets affect your natal chart. Major transits of Jupiter, Saturn, and other slow-moving planets create significant life changes. Sade Sati (Saturn's 7.5-year transit) is particularly important, bringing both challenges and growth opportunities. Understanding current and upcoming transits helps in planning and preparation for life changes.`
      : `Planetary transits continue to influence your chart throughout life, creating periods of opportunity and challenge.`,

    remedies: `Vedic astrology provides various remedial measures to enhance positive planetary influences and mitigate challenges. Mantras specific to weak planets can strengthen their positive effects. Gemstones corresponding to beneficial planets can be worn for support. Yantras (sacred geometries) can be used for meditation and energy enhancement. Charitable activities, fasting, and spiritual practices aligned with planetary energies provide karmic relief. Regular worship and devotion to planetary deities brings divine grace and protection.`,

    conclusion: `Your Vedic astrology chart is a divine blueprint that reveals your soul's journey in this lifetime. The planetary positions and their interactions show both your inherent potential and the challenges you're meant to overcome. By understanding these cosmic influences and following appropriate remedial measures, you can align with your dharma (life purpose) and achieve greater fulfillment. Remember that astrology is a guide, and your free will and spiritual practices ultimately shape your destiny. May this knowledge bring you wisdom, peace, and prosperity on your spiritual journey.`,
  };

  return JSON.stringify(vedicReport);
}

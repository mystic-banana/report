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
    console.log("Vedic report generation started");
    const { birthData, chartData, isPremium, reportType } = await req.json();
    console.log("Request data received:", {
      hasbirthData: !!birthData,
      hasChartData: !!chartData,
      isPremium,
      reportType,
    });

    // Validate required data
    if (!birthData || !chartData) {
      console.error("Missing required data:", {
        birthData: !!birthData,
        chartData: !!chartData,
      });
      return new Response(
        JSON.stringify({ error: "Birth data and chart data are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare comprehensive Vedic astrology prompt
    const systemPrompt = `You are an expert Vedic astrologer with deep knowledge of Jyotish shastra. Generate a detailed, professional, and spiritually meaningful Vedic astrology report based on the provided birth details and chart data.

${isPremium ? "PREMIUM REPORT - Include ALL sections with comprehensive analysis:" : "BASIC REPORT - Focus on essential insights:"}

1. **Janma Kundali (Birth Chart Analysis)**
   - Lagna (Ascendant) significance and characteristics
   - Planetary positions in signs and houses with degrees
   - Retrograde planets and their effects
   - Exaltation, debilitation, and planetary dignity
   - ${isPremium ? "Navamsa (D9) chart analysis for marriage and spirituality" : "Basic planetary placements"}

2. **Bhava (House) Analysis**
   - Detailed interpretation of each house (1st through 12th)
   - House lords and their placements
   - Planetary influences on life areas
   - ${isPremium ? "Bhava strength (Bala) calculations" : "Key house significances"}

3. **Graha (Planetary) Analysis**
   - Natural and functional benefics/malefics
   - Planetary strengths and weaknesses
   - Karaka planets for different life domains
   - ${isPremium ? "Shadbala and Ashtakavarga analysis" : "Basic planetary effects"}

4. **Nakshatra Insights**
   - Birth nakshatra (lunar mansion) and pada
   - Ruling deity, symbol, and characteristics
   - Personality traits and spiritual inclinations
   - ${isPremium ? "Nakshatra compatibility and remedial measures" : "Basic nakshatra influence"}

5. **Dasha System**
   - Current Vimshottari Mahadasha and Antardasha
   - Dasha timeline and planetary periods
   - ${isPremium ? "Detailed dasha predictions and timing of events" : "Current dasha effects"}

${
  isPremium
    ? `6. **Yogas and Doshas**
   - Beneficial yogas (Raj Yoga, Dhana Yoga, Gaja Kesari, etc.)
   - Malefic doshas (Manglik, Kaal Sarp, Pitra Dosha)
   - Remedial measures for doshas

7. **Transits and Sade Sati**
   - Current planetary transits (Gochar)
   - Sade Sati analysis if applicable
   - Upcoming significant transits

8. **Spiritual Path and Remedies**
   - Personalized mantras and spiritual practices
   - Gemstone recommendations
   - Yantra suggestions
   - Charitable activities and fasting
   - Temple worship recommendations`
    : ""
}

9. **Remedies and Guidance**
   - Practical remedial measures
   - Spiritual practices for growth
   - Lifestyle recommendations
   - Auspicious timing suggestions

10. **Life Purpose and Dharma**
    - Soul's journey and karmic lessons
    - Life purpose based on chart analysis
    - Spiritual evolution path

Format as JSON with these keys: introduction, janmaKundali, bhavaAnalysis, grahaAnalysis, nakshatraInsights, dashaAnalysis, ${isPremium ? "yogasAndDoshas, planetaryStrengths, transits, " : ""}remedies, conclusion.

Make the analysis personal, accurate, and spiritually uplifting. Use traditional Vedic terminology with clear explanations.`;

    const userPrompt = `Create a ${isPremium ? "comprehensive premium" : "detailed basic"} Vedic astrology report for:

**Personal Information:**
- Name: ${birthData.name}
- Birth Date: ${birthData.birthDate}
- Birth Time: ${birthData.birthTime || "Time not provided (use solar chart principles)"}
- Birth Location: ${birthData.location?.city}, ${birthData.location?.country}
- Coordinates: ${birthData.location?.latitude}°, ${birthData.location?.longitude}°

**Astrological Data:**
- Planetary Positions: ${JSON.stringify(
      chartData.planets?.slice(0, 10).map((p) => ({
        planet: p.name,
        sign: p.sign,
        house: p.house,
        degree: Math.round(p.degree * 100) / 100,
        retrograde: p.retrograde || false,
      })),
    )}

- House Cusps: ${JSON.stringify(
      chartData.houses?.slice(0, 12).map((h) => ({
        house: h.house,
        sign: h.sign,
        cusp: h.cusp || 0,
      })),
    )}

- Major Aspects: ${JSON.stringify(
      chartData.aspects?.slice(0, 8).map((a) => ({
        planet1: a.planet1,
        planet2: a.planet2,
        aspect: a.aspect,
        orb: Math.round(a.orb * 100) / 100,
      })),
    )}

**Report Requirements:**
- Analysis Level: ${isPremium ? "Premium (comprehensive with all sections)" : "Basic (essential insights)"}
- Focus: Traditional Vedic principles with practical guidance
- Include: Spiritual insights, karmic lessons, and remedial measures
- Format: Well-structured JSON with clear sections

Provide a meaningful, accurate, and spiritually enriching analysis that honors the ancient wisdom of Jyotish while being accessible to modern seekers.`;

    // Try OpenAI API with robust error handling and retry mechanism
    let content = "";
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries && !content) {
      try {
        // Try PICA passthrough API for OpenAI
        const picaSecret = Deno.env.get("PICA_SECRET_KEY");
        const picaConnectionKey = Deno.env.get("PICA_OPENAI_CONNECTION_KEY");
        console.log(`PICA API attempt ${retryCount + 1}/${maxRetries}:`, {
          hasSecret: !!picaSecret,
          hasConnectionKey: !!picaConnectionKey,
        });

        if (picaSecret && picaConnectionKey) {
          console.log("Making PICA API call...");

          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(
            "https://api.picaos.com/v1/passthrough/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-pica-secret": picaSecret,
                "x-pica-connection-key": picaConnectionKey,
                "x-pica-action-id":
                  "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA",
              },
              body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                max_completion_tokens: isPremium ? 3000 : 1500,
                temperature: 0.7,
              }),
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          if (response.status === 429) {
            // Rate limit hit - implement exponential backoff
            const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(
              `Rate limit hit, waiting ${backoffDelay}ms before retry...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            retryCount++;
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error("PICA API error details:", {
              status: response.status,
              statusText: response.statusText,
              errorText,
              attempt: retryCount + 1,
            });

            // For server errors (5xx), retry; for client errors (4xx), don't retry
            if (response.status >= 500 && retryCount < maxRetries - 1) {
              retryCount++;
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retryCount),
              );
              continue;
            }

            throw new Error(
              `PICA API error: ${response.status} ${response.statusText} - ${errorText}`,
            );
          }

          const result = await response.json();
          console.log("PICA API response received:", {
            hasChoices: !!result.choices,
            choicesLength: result.choices?.length,
            hasUsage: !!result.usage,
            attempt: retryCount + 1,
          });

          content = result.choices?.[0]?.message?.content;

          if (!content) {
            console.error("No content in API response:", result);
            throw new Error("No content received from AI service");
          }
          console.log("AI content received, length:", content.length);
          break; // Success, exit retry loop
        } else {
          console.warn("PICA credentials not found, using fallback content");
          break; // No credentials, exit retry loop
        }
      } catch (error) {
        lastError = error;
        console.warn(
          `PICA API attempt ${retryCount + 1} failed:`,
          error.message,
        );

        if (error.name === "AbortError") {
          console.warn("Request timed out");
        }

        retryCount++;

        if (retryCount < maxRetries) {
          const backoffDelay = Math.pow(2, retryCount - 1) * 1000;
          console.log(`Retrying in ${backoffDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    if (!content && lastError) {
      console.error(
        `All ${maxRetries} API attempts failed. Last error:`,
        lastError.message,
      );
    }

    // Fallback to comprehensive mock content if API fails
    if (!content) {
      console.log("Using fallback content generation");
      content = generateFallbackVedicContent(birthData, isPremium);
    }

    // Try to parse as JSON, fallback to structured text
    let vedicReport;
    try {
      console.log("Attempting to parse content as JSON");
      vedicReport = JSON.parse(content);
      console.log("JSON parsing successful");
    } catch (parseError) {
      console.log(
        "JSON parsing failed, creating structured response:",
        parseError,
      );
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

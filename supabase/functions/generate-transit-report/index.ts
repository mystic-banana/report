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
    console.log("Transit report generation started");
    const { birthData, chartData, isPremium, transitPeriod } = await req.json();
    console.log("Request data received:", {
      hasBirthData: !!birthData,
      hasChartData: !!chartData,
      isPremium,
      transitPeriod,
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

    const systemPrompt = `You are an expert astrologer specializing in planetary transits and their effects on personal birth charts. Generate detailed, professional, and accurate transit reports with precise timing and predictive insights.

For ${isPremium ? "PREMIUM" : "FREE"} users, include these sections:

**FREE USER SECTIONS:**
1. Personal Details Summary - Name, birth info, Sun/Moon/Rising signs
2. Current Major Transits - Top 3-4 significant transits with interpretations and exact dates
3. Transit Timeline - Key dates for the next 30 days with planetary movements
4. General Effects - Emotional, mental, physical influences with timing
5. House Activation - Which life areas are highlighted with specific dates
6. Basic Recommendations - 3-4 actionable suggestions
7. Transit Calendar - Next 5 key dates with descriptions

**PREMIUM USER SECTIONS (All of above plus):**
1. Comprehensive Transit Analysis - All major and minor transits with exact timing (hours/minutes)
2. Detailed Aspect Interpretations - Every conjunction, square, opposition, trine, sextile to natal planets
3. Predictive Timeline - 90-day forecast with peak dates and duration of influences
4. Life Area Deep Dive - Career & Finances, Relationships & Love, Health & Well-being, Spiritual Growth, Family & Home (4+ detailed sentences each)
5. Long-Term Outer Planet Analysis - Saturn, Uranus, Neptune, Pluto impacts over 6-12 months
6. Retrograde Impact Analysis - How retrograde periods affect your chart specifically
7. Personalized Remedies & Timing - Crystals, colors, activities, best times for important decisions
8. Transit Aspect Visualization Data - Coordinates and timing for interactive charts
9. Predictive Insights - What to expect and when, with confidence levels
10. Smart Summary - Comprehensive "What this period means for you" with actionable timeline

Include exact dates, times (when significant), orb degrees, and duration for all transits. Format as structured JSON with clear section keys and timing data.`;

    const userPrompt = `Generate a comprehensive transit report for:

Name: ${birthData.name}
Birth Date: ${birthData.birthDate}
Birth Time: ${birthData.birthTime || "Not provided"}
Birth Location: ${birthData.location?.city}, ${birthData.location?.country}

Chart Data Summary:
- Sun Sign: ${chartData.planets?.find((p) => p.name === "Sun")?.sign || "Unknown"}
- Moon Sign: ${chartData.planets?.find((p) => p.name === "Moon")?.sign || "Unknown"}
- Rising Sign: ${chartData.planets?.find((p) => p.name === "Ascendant")?.sign || "Unknown"}
- Key Planets: ${JSON.stringify(chartData.planets?.slice(0, 10).map((p) => ({ name: p.name, sign: p.sign, house: p.house })))}

Transit Period: ${transitPeriod || "Current"}
User Tier: ${isPremium ? "Premium" : "Free"}

Generate a detailed transit report with all the sections mentioned for the user's tier. Include practical guidance and specific timing for upcoming transits.`;

    // Prepare messages for the API call
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Call the PICA passthrough API with robust error handling and retry mechanism
    const picaSecret = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_OPENAI_CONNECTION_KEY");

    const maxRetries = 3;
    let retryCount = 0;
    let content = null;
    let lastError = null;

    while (retryCount < maxRetries && !content) {
      try {
        console.log(
          `Making PICA API call (attempt ${retryCount + 1}/${maxRetries})...`,
        );

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for longer reports

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
              messages: messages,
              n: 1,
              max_completion_tokens: isPremium ? 4000 : 2000,
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
        console.log(`PICA API response received (attempt ${retryCount + 1})`);

        content = result.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("No content received from AI service");
        }
        break; // Success, exit retry loop
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

    if (!content) {
      console.error(
        `All ${maxRetries} API attempts failed. Last error:`,
        lastError?.message,
      );
      throw new Error(
        `Failed to generate transit report after ${maxRetries} attempts: ${lastError?.message}`,
      );
    }

    // Try to parse as JSON, fallback to structured text
    let transitReport;
    try {
      transitReport = JSON.parse(content);
    } catch (parseError) {
      console.log("JSON parsing failed, creating structured response");
      // If not valid JSON, create structured response
      transitReport = {
        personalDetails: {
          name: birthData.name,
          birthDate: birthData.birthDate,
          sunSign:
            chartData.planets?.find((p) => p.name === "Sun")?.sign || "Unknown",
          moonSign:
            chartData.planets?.find((p) => p.name === "Moon")?.sign ||
            "Unknown",
          risingSign:
            chartData.planets?.find((p) => p.name === "Ascendant")?.sign ||
            "Unknown",
        },
        currentTransits:
          "Major planetary movements are influencing your chart this period.",
        transitEffects:
          "These cosmic influences bring opportunities for growth and transformation.",
        transitCalendar: isPremium
          ? "Detailed calendar with exact timing available."
          : "Next 3 key dates: Check premium for full calendar.",
        lifeAreaImpacts: isPremium
          ? {
              career: "Professional opportunities and challenges highlighted.",
              relationships:
                "Relationship dynamics shifting with new possibilities.",
              health: "Focus on wellness and energy management.",
              spiritual: "Spiritual growth and inner development emphasized.",
              family: "Family matters and home environment in focus.",
            }
          : "Upgrade to premium for detailed life area analysis.",
        recommendations: isPremium
          ? [
              "Practice daily meditation during this transformative period",
              "Focus on clear communication in all relationships",
              "Take advantage of career opportunities presenting themselves",
            ]
          : ["Upgrade to premium for personalized recommendations"],
        fullContent: content,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: transitReport,
        isPremium,
        transitPeriod: transitPeriod || "Current",
        generatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Transit report generation error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate transit report",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

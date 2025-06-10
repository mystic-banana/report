import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    console.log("Daily horoscope generation started");
    const { zodiacSign, date, birthChart, currentTransits, isPremium } =
      await req.json();
    console.log("Request data received:", {
      zodiacSign,
      date,
      hasBirthChart: !!birthChart,
      hasCurrentTransits: !!currentTransits,
      isPremium,
    });

    // Validate required data
    if (!zodiacSign || !date) {
      console.error("Missing required data:", {
        zodiacSign: !!zodiacSign,
        date: !!date,
      });
      return new Response(
        JSON.stringify({ error: "Zodiac sign and date are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt = `You are an expert astrologer generating personalized daily horoscopes. Create engaging, accurate, and actionable daily guidance based on the user's zodiac sign and current planetary transits.

For ${isPremium ? "PREMIUM" : "FREE"} users, include these elements:

**FREE USER HOROSCOPE:**
1. Daily Overview - General cosmic influences for the zodiac sign (2-3 sentences)
2. Love & Relationships - Brief romantic guidance (1-2 sentences)
3. Career & Money - Work and financial insights (1-2 sentences)
4. Health & Wellness - Physical and mental well-being tips (1-2 sentences)
5. Lucky Elements - 2-3 lucky numbers and 2 lucky colors
6. Daily Affirmation - Positive affirmation for the day
7. General advice and cosmic timing

**PREMIUM USER HOROSCOPE (All of above plus):**
1. Personalized Transit Analysis - How current planetary movements specifically affect their birth chart
2. Detailed Life Area Breakdown - Career, Love, Health, Spiritual, Family (2+ sentences each)
3. Exact Timing - Best hours of the day for important activities
4. Personalized Remedies - Specific crystals, colors, activities based on their chart
5. Moon Phase Influence - How today's lunar energy affects them personally
6. Chakra Focus - Which energy center to focus on today
7. Detailed Lucky Elements - Extended lucky numbers, colors, and gemstones
8. Personal Growth Insights - Deeper spiritual and psychological guidance

Format as structured JSON with clear sections. Make the content personal, uplifting, and actionable.`;

    let userPrompt = `Generate a comprehensive daily horoscope for:

Zodiac Sign: ${zodiacSign}
Date: ${date}
User Tier: ${isPremium ? "Premium" : "Free"}

`;

    // Add birth chart data for premium users
    if (isPremium && birthChart) {
      userPrompt += `Birth Chart Data:
- Sun Sign: ${birthChart.planets?.find((p) => p.name === "Sun")?.sign || zodiacSign}
- Moon Sign: ${birthChart.planets?.find((p) => p.name === "Moon")?.sign || "Unknown"}
- Rising Sign: ${birthChart.planets?.find((p) => p.name === "Ascendant")?.sign || "Unknown"}
- Key Planetary Positions: ${JSON.stringify(birthChart.planets?.slice(0, 7).map((p) => ({ name: p.name, sign: p.sign, house: p.house })))}

`;
    }

    // Add current transits if available
    if (currentTransits && currentTransits.length > 0) {
      userPrompt += `Current Planetary Transits:
${JSON.stringify(currentTransits)}

`;
    }

    userPrompt += `Generate a detailed daily horoscope with all the sections mentioned for the user's tier. Include practical guidance, timing, and personalized insights.`;

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
              messages: messages,
              n: 1,
              max_completion_tokens: isPremium ? 2000 : 1000,
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
        `Failed to generate horoscope after ${maxRetries} attempts: ${lastError?.message}`,
      );
    }

    // Try to parse as JSON, fallback to structured text
    let horoscopeData;
    try {
      horoscopeData = JSON.parse(content);
    } catch (parseError) {
      console.log("JSON parsing failed, creating structured response");
      // If not valid JSON, create structured response
      horoscopeData = {
        dailyOverview: content.substring(0, 200) + "...",
        love: "Focus on communication and understanding in relationships today.",
        career:
          "Professional opportunities may present themselves. Stay alert.",
        health: "Pay attention to your energy levels and practice self-care.",
        luckyNumbers: [
          Math.floor(Math.random() * 50) + 1,
          Math.floor(Math.random() * 50) + 1,
          Math.floor(Math.random() * 50) + 1,
        ],
        luckyColors: ["Blue", "Silver"],
        affirmation:
          "I am aligned with the cosmic flow and open to today's possibilities.",
        loveScore: Math.floor(Math.random() * 30) + 70,
        careerScore: Math.floor(Math.random() * 30) + 70,
        healthScore: Math.floor(Math.random() * 30) + 70,
        fullContent: content,
      };
    }

    // Generate scores if not provided
    if (!horoscopeData.loveScore) {
      horoscopeData.loveScore = Math.floor(Math.random() * 30) + 70;
    }
    if (!horoscopeData.careerScore) {
      horoscopeData.careerScore = Math.floor(Math.random() * 30) + 70;
    }
    if (!horoscopeData.healthScore) {
      horoscopeData.healthScore = Math.floor(Math.random() * 30) + 70;
    }

    // Ensure lucky elements exist
    if (!horoscopeData.luckyNumbers) {
      horoscopeData.luckyNumbers = [
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
      ];
    }
    if (!horoscopeData.luckyColors) {
      horoscopeData.luckyColors = ["Purple", "Gold"];
    }

    return new Response(
      JSON.stringify({
        success: true,
        horoscope: horoscopeData,
        zodiacSign,
        date,
        isPremium,
        generatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Daily horoscope generation error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate daily horoscope",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

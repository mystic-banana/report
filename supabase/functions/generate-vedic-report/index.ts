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

    // Call PICA API for Vedic report generation
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
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
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_completion_tokens: isPremium ? 4000 : 2000,
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

import { corsHeaders } from "./_shared/cors.ts";

interface HoroscopeRequest {
  zodiacSign: string;
  date?: string;
}

interface HoroscopeResponse {
  horoscope: string;
  cachedAt: string;
  love_score: number;
  career_score: number;
  health_score: number;
  lucky_numbers: number[];
  lucky_colors: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      zodiacSign,
      date = new Date().toISOString().split("T")[0],
    }: HoroscopeRequest = await req.json();

    if (!zodiacSign) {
      return new Response(
        JSON.stringify({ error: "Zodiac sign is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for cached horoscope within last 24 hours
    const { data: cached, error: cacheError } = await supabase
      .from("daily_horoscopes")
      .select("*")
      .eq("zodiac_sign", zodiacSign)
      .eq("date", date)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (!cacheError && cached) {
      // Return cached horoscope
      return new Response(
        JSON.stringify({
          horoscope: cached.content,
          cachedAt: cached.created_at,
          love_score: cached.love_score,
          career_score: cached.career_score,
          health_score: cached.health_score,
          lucky_numbers: cached.lucky_numbers,
          lucky_colors: cached.lucky_colors,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate new horoscope using OpenAI via Pica passthrough
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_openai_CONNECTION_KEY");

    if (!picaSecretKey || !picaConnectionKey) {
      throw new Error("Pica API keys not configured");
    }

    const openaiResponse = await fetch(
      "https://api.picaos.com/v1/passthrough/gpt-4o-mini/chat/completions",
      {
        method: "POST",
        headers: {
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a professional astrologer creating daily horoscopes. Provide insightful, positive, and actionable guidance.",
            },
            {
              role: "user",
              content: `Generate a detailed daily horoscope for ${zodiacSign} for ${date}. Include guidance on love, career, health, and general life advice. Make it inspiring and practical.`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      },
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const horoscopeContent = openaiData.choices[0]?.message?.content;

    if (!horoscopeContent) {
      throw new Error("Failed to generate horoscope content");
    }

    // Generate random scores and lucky elements
    const love_score = Math.floor(Math.random() * 30) + 70;
    const career_score = Math.floor(Math.random() * 30) + 70;
    const health_score = Math.floor(Math.random() * 30) + 70;
    const lucky_numbers = Array.from(
      { length: 3 },
      () => Math.floor(Math.random() * 50) + 1,
    );
    const lucky_colors = [
      "Purple",
      "Gold",
      "Silver",
      "Blue",
      "Green",
      "Red",
    ].slice(0, 2);

    // Cache the horoscope for 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("daily_horoscopes")
      .upsert({
        zodiac_sign: zodiacSign,
        date: date,
        content: horoscopeContent,
        love_score,
        career_score,
        health_score,
        lucky_numbers,
        lucky_colors,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Error caching horoscope:", insertError);
    }

    const response: HoroscopeResponse = {
      horoscope: horoscopeContent,
      cachedAt: new Date().toISOString(),
      love_score,
      career_score,
      health_score,
      lucky_numbers,
      lucky_colors,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-cached-horoscope:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate horoscope",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

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
    console.log("Chat with astrologer request started");
    const { chartData, userQuestion, conversationHistory } = await req.json();

    console.log("Request data received:", {
      hasChartData: !!chartData,
      userQuestion: userQuestion?.substring(0, 100),
      historyLength: conversationHistory?.length || 0,
    });

    // Validate required data
    if (!chartData || !userQuestion) {
      console.error("Missing required data:", {
        chartData: !!chartData,
        userQuestion: !!userQuestion,
      });
      return new Response(
        JSON.stringify({ error: "Chart data and user question are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare the system prompt for the AI astrologer
    const systemPrompt = `You are a professional astrologer with deep knowledge of Western astrology, Vedic astrology, and spiritual guidance. You have access to the user's astrological data and should provide insightful, helpful, and spiritually meaningful responses.

User's Astrological Data:
${chartData}

Guidelines for your responses:
- Keep answers helpful, spiritual, and beginner-friendly
- Use a wise, poetic, and reflective tone
- Avoid "I am just an AI" disclaimers - respond as a professional astrologer
- Provide specific insights based on the chart data provided
- Offer spiritual suggestions, meditations, or affirmations when appropriate
- Allow for follow-up questions and deeper exploration
- Focus on empowerment and personal growth
- Use astrological terminology appropriately but explain complex concepts
- Draw connections between planetary positions and life experiences
- Provide practical guidance alongside spiritual insights

Answer the user's question based on their specific astrological profile.`;

    // Prepare conversation messages
    const messages = [{ role: "system", content: systemPrompt }];

    // Add conversation history for context (last few messages)
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Add current user question
    messages.push({ role: "user", content: userQuestion });

    // Call the PICA passthrough API for OpenAI
    const picaSecret = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_OPENAI_CONNECTION_KEY");

    console.log("PICA credentials check:", {
      hasSecret: !!picaSecret,
      hasConnectionKey: !!picaConnectionKey,
    });

    if (!picaSecret || !picaConnectionKey) {
      throw new Error("PICA credentials not configured");
    }

    console.log("Making PICA API call...");
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
          messages,
          temperature: 0.7,
          max_completion_tokens: 500,
          n: 1,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PICA API error details:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(
        `PICA API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("PICA API response received:", {
      hasChoices: !!result.choices,
      choicesLength: result.choices?.length,
    });

    const aiResponse = result.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No content in API response:", result);
      throw new Error("No response received from AI service");
    }

    console.log("AI response received, length:", aiResponse.length);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Chat with astrologer error:", error);

    // Provide a fallback response
    const fallbackResponse = `I sense your cosmic energy seeking guidance, dear seeker. While I'm experiencing some celestial interference at the moment, I encourage you to trust your intuition and inner wisdom. The stars are always guiding you, even when their messages seem unclear. Please try reaching out again, and I'll be here to help illuminate your path.`;

    return new Response(
      JSON.stringify({
        success: true,
        response: fallbackResponse,
        error: "Fallback response due to service interruption",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

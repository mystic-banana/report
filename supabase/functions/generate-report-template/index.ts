// Edge function for generating report template content using OpenAI

import { corsHeaders } from "../functions_shared/cors.ts";

const PICA_SECRET = Deno.env.get("PICA_SECRET_KEY");
const PICA_OPENAI_CONNECTION_KEY = Deno.env.get("PICA_OPENAI_CONNECTION_KEY");
const ACTION_ID = "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA";

interface ChatMessage {
  role: string;
  content: string | any[];
  name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PICA_SECRET || !PICA_OPENAI_CONNECTION_KEY) {
      throw new Error("Missing required environment variables");
    }

    const {
      messages,
      model = "gpt-4o",
      templateType,
      reportType,
    } = await req.json();

    // Prepare system message with context about astrology reports
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are an expert astrologer specializing in creating content for ${reportType || "astrology"} reports. 
      Generate detailed, professional content for a ${templateType || "standard"} astrology report template. 
      The content should be informative, accurate, and formatted appropriately for an astrology report.`,
    };

    // Add system message at the beginning if not already included
    const allMessages = messages.some((m) => m.role === "system")
      ? messages
      : [systemMessage, ...messages];

    const url = "https://api.picaos.com/v1/passthrough/chat/completions";
    const body = {
      model,
      messages: allMessages,
      n: 1,
      temperature: 0.7,
      presence_penalty: 0,
      frequency_penalty: 0,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET,
        "x-pica-connection-key": PICA_OPENAI_CONNECTION_KEY,
        "x-pica-action-id": ACTION_ID,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

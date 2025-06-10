// Simplified test version of the Edge Function for debugging
// This creates a minimal Edge Function to test core functionality

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Mock environment variables - replace with your actual values if testing locally
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Basic environment variable check
    const envCheck = {
      supabase_url_set: !!SUPABASE_URL,
      service_key_set: !!SUPABASE_SERVICE_ROLE_KEY, 
      openai_key_set: !!OPENAI_API_KEY,
      pexels_key_set: !!PEXELS_API_KEY
    };

    // Test OpenAI connection if key is available
    let openaiStatus = "Not tested (no key)";
    if (OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        });
        openaiStatus = openaiResponse.ok ? 
          "Connected successfully" : 
          `Error: ${openaiResponse.status} ${await openaiResponse.text()}`;
      } catch (err) {
        openaiStatus = `Connection error: ${err.message}`;
      }
    }

    // Test Supabase connection if credentials are available
    let supabaseStatus = "Not tested (no credentials)";
    let categories = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data, error } = await supabase.from('categories').select('id, name').limit(3);
        
        supabaseStatus = error ? 
          `Error: ${error.message}` : 
          "Connected successfully";
        
        if (data) {
          categories = data;
        }
      } catch (err) {
        supabaseStatus = `Connection error: ${err.message}`;
      }
    }

    // Return diagnostic information
    return new Response(JSON.stringify({
      message: "Edge Function Diagnostics",
      environment: envCheck,
      openai: { status: openaiStatus },
      supabase: { 
        status: supabaseStatus,
        sample_categories: categories
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Diagnostic error",
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

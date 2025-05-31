// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, and type checking.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers inline
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Debug OpenAI Function Initialized');

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check if environment variables are set
    const envCheck = {
      openai_key_set: !!OPENAI_API_KEY,
      supabase_url_set: !!SUPABASE_URL,
      supabase_key_set: !!SUPABASE_SERVICE_ROLE_KEY
    };

    // Test OpenAI connection if key is available
    let openaiStatus = "Not tested (no key)";
    let openaiModels = [];
    if (OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        });
        
        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          openaiStatus = "Connected successfully";
          openaiModels = data.data.slice(0, 5).map((m: any) => m.id);
        } else {
          openaiStatus = `Error: ${openaiResponse.status} ${await openaiResponse.text()}`;
        }
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
      openai: { 
        status: openaiStatus,
        models: openaiModels
      },
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

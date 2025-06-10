// A simplified version of the generate-ai-article Edge Function
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

// Initialize Supabase client
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Simple function to generate content with OpenAI
async function generateContent(prompt: string, model: string) {
  console.log(`Generating content with model: ${model}`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${errorText}`);
      return { error: `OpenAI API error: ${response.status}`, details: errorText };
    }

    const data = await response.json();
    return { 
      success: true, 
      content: data.choices?.[0]?.message?.content || 'No content generated' 
    };
  } catch (error) {
    console.error('Error in generateContent:', error);
    return { error: 'Error generating content', details: error.message };
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  console.log('Received request to simple-article function');

  try {
    // Get the request body
    const { category_id, model } = await req.json();
    console.log('Request parameters:', { category_id, model });

    // Validate input
    if (!category_id) {
      return new Response(JSON.stringify({ error: 'Category ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Get the user from the auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Authenticating user with token');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Authentication error:', userError?.message || 'User not found');
      return new Response(JSON.stringify({ error: 'Invalid or expired token', details: userError?.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    console.log('User authenticated successfully:', user.id);

    // 2. Get category details
    console.log('Fetching category details for ID:', category_id);
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', category_id)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      return new Response(JSON.stringify({ error: 'Failed to fetch category details', details: categoryError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    console.log('Category details:', {
      name: category.name,
      ai_prompt: category.ai_prompt,
      ai_model: category.ai_model
    });

    // 3. Generate content
    const modelToUse = model || category.ai_model || 'gpt-4-turbo-preview';
    const prompt = category.ai_prompt || 'Generate a simple article';
    
    const result = await generateContent(prompt, modelToUse);
    
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 4. Return the result
    return new Response(JSON.stringify({ 
      message: 'Content generated successfully!',
      category: category.name,
      model: modelToUse,
      content: result.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

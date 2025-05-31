// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, and type checking.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers inline instead of importing from shared file
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Generate AI Article Function Initialized');

// Define minimal interfaces for API responses
interface Category {
  id: string;
  name: string;
  ai_prompt: string | null;
  ai_model: string | null;
}

interface ArticlePayload {
  title: string;
  content: string; 
  category_id: string;
  author_id: string | null; 
  slug: string;
  status: 'draft' | 'published';
  meta_description: string;
  tags: string[];
  generated_by_ai: boolean;
}

interface OpenAIArticleOutput {
  title: string;
  html_content: string;
  meta_description: string;
  tags: string[];
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

// Initialize Supabase client with service_role key
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Simplified article generation function
async function generateArticleContentWithOpenAI(
  prompt: string, 
  categoryName: string,
  model: string = "gpt-4.1-nano"
): Promise<OpenAIArticleOutput | null> { 
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured.');
    return null;
  }

  // Simple system message
  const systemMessage = `You are an expert content creator specializing in ${categoryName}. 
Create an engaging and informative article based on the provided prompt. 
Return your response as a JSON object with these keys:
"title" (string, catchy and SEO-friendly), 
"html_content" (string, well-structured HTML content with headings, paragraphs, and lists), 
"meta_description" (string, concise, around 150-160 characters), 
"tags" (array of 3-5 relevant string keywords).`;
  
  const userPrompt = `Category: ${categoryName}\nUser's Core Prompt: ${prompt}`;

  try {
    console.log(`Generating article for ${categoryName} using ${model}...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model, 
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: "json_object" }, 
        temperature: 0.7, 
        max_tokens: 2000, // Reduced for testing
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenAI API error: ${response.status} ${errorBody}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenAI response did not contain content.');
      return null;
    }

    try {
      const parsedContent = JSON.parse(content);
      
      if (parsedContent.title && parsedContent.html_content && parsedContent.meta_description && Array.isArray(parsedContent.tags)) {
        return parsedContent as OpenAIArticleOutput;
      } else {
        console.error('OpenAI response JSON structure is invalid.');
        return null;
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error in generateArticleContentWithOpenAI:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received request for article generation');
    
    // 1. Get JWT from Authorization header and authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const jwt = authHeader.replace('Bearer ', '');
    
    // Authenticate user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    console.log(`Request authenticated for user: ${user.id}`);

    // 2. Get categoryId from request body
    const requestData = await req.json();
    const categoryId = requestData.categoryId;

    if (!categoryId) {
      return new Response(JSON.stringify({ error: 'Missing categoryId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Fetch category details
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id, name, ai_prompt, ai_model')
      .eq('id', categoryId)
      .single<Category>();

    if (categoryError || !category) {
      return new Response(JSON.stringify({ error: 'Failed to fetch category details' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    if (!category.ai_prompt) {
      return new Response(JSON.stringify({ error: 'AI prompt not set for this category' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // 4. Generate article content
    const aiModelToUse = category.ai_model || 'gpt-4.1-nano';
    const generatedContent = await generateArticleContentWithOpenAI(
      category.ai_prompt,
      category.name,
      aiModelToUse
    );

    if (!generatedContent) {
      return new Response(JSON.stringify({ error: 'Failed to generate article content with OpenAI' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 5. Create a slug
    const slug = generatedContent.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-5);

    // 6. Prepare article payload without images for now
    const articlePayload: ArticlePayload = {
      title: generatedContent.title,
      content: generatedContent.html_content,
      category_id: category.id,
      author_id: user.id, 
      slug: slug,
      status: 'draft', 
      meta_description: generatedContent.meta_description,
      tags: generatedContent.tags,
      generated_by_ai: true,
    };

    // 7. Insert article into Supabase
    const { data: newArticle, error: insertError } = await supabaseAdmin
      .from('articles')
      .insert(articlePayload)
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Failed to save the generated article.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Article generated successfully!', 
      article: newArticle
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

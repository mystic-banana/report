// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, and type checking.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Generate AI Article Function Initialized');

// Define interfaces for API responses and data structures
interface Category {
  id: string;
  name: string;
  ai_prompt: string | null;
  ai_model: string | null;
  // Add other category fields if needed
}

interface ArticlePayload {
  title: string;
  content: string; // HTML content
  category_id: string;
  author_id: string | null; 
  slug: string;
  status: 'draft' | 'published';
  meta_description: string;
  tags: string[];
  featured_image_url?: string;
  featured_image_alt?: string;
  generated_by_ai: boolean;
}

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  photographer: string;
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

interface OpenAIArticleOutput {
  title: string;
  html_content: string;
  meta_description: string;
  tags: string[];
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

// Initialize Supabase client with service_role key for admin-level access
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    // autoRefreshToken: false, // Optional: configure as needed
    // persistSession: false, // Optional: configure as needed
  }
});

// Helper function to fetch image from Pexels and upload to Supabase Storage
async function fetchAndStoreImage(query: string, articleSlug: string): Promise<{ publicUrl: string; altText: string } | null> {
  if (!PEXELS_API_KEY) {
    console.warn('Pexels API key not configured. Skipping image fetching.');
    return null;
  }

  try {
    const pexelsSearchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
    const pexelsResponse = await fetch(pexelsSearchUrl, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!pexelsResponse.ok) {
      console.error(`Pexels API error: ${pexelsResponse.status} ${await pexelsResponse.text()}`);
      return null;
    }

    const pexelsData: PexelsResponse = await pexelsResponse.json();
    if (!pexelsData.photos || pexelsData.photos.length === 0) {
      console.warn(`No Pexels image found for query: ${query}`);
      return null;
    }

    const photo = pexelsData.photos[0];
    const imageUrl = photo.src.large; // Or other sizes like 'original', 'medium'
    const imageAltText = photo.alt || `Image related to ${query}`;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to download image from Pexels: ${imageResponse.status}`);
      return null;
    }
    const imageBlob = await imageResponse.blob();
    const imageContentType = imageBlob.type || 'image/jpeg'; // Default if type is not obvious
    const fileExtension = imageContentType.split('/')[1] || 'jpg';
    const imageName = `${articleSlug}-${Date.now()}.${fileExtension}`;
    const imagePath = `public/${imageName}`; // Path within the 'images' bucket

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('images') // Your bucket name
      .upload(imagePath, imageBlob, {
        contentType: imageContentType,
        cacheControl: '3600', // Cache for 1 hour, adjust as needed
        upsert: false, // Don't upsert, fail if file exists (or change to true if needed)
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(uploadData.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Could not get public URL for uploaded image.');
        return null;
    }

    console.log(`Image uploaded to Supabase Storage: ${publicUrlData.publicUrl}`);
    return { publicUrl: publicUrlData.publicUrl, altText: imageAltText };

  } catch (error) {
    console.error('Error in fetchAndStoreImage:', error);
    return null;
  }
}

// Helper function to generate article content with OpenAI
async function generateArticleContentWithOpenAI(prompt: string, categoryName: string, model: string = "gpt-4.1-nano"): Promise<OpenAIArticleOutput | null> { 
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured.');
    return null;
  }

  const systemMessage = `You are an expert content creator and SEO specialist. Your task is to generate an engaging and informative article based on the provided prompt and category. The article should be suitable for a blog. Please return the output as a JSON object with the following keys: "title" (string, catchy and SEO-friendly), "html_content" (string, well-structured HTML for the article body, include headings, paragraphs, and lists where appropriate), "meta_description" (string, concise and compelling, around 150-160 characters), and "tags" (array of 3-5 relevant string keywords).`;
  
  const userPrompt = `Category: ${categoryName}\nUser's Core Prompt: ${prompt}`;

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
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: "json_object" }, 
        temperature: 0.7, 
        max_tokens: 3800, 
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

    // Attempt to parse the JSON string content
    try {
      const parsedContent: OpenAIArticleOutput = JSON.parse(content);
      // Basic validation of the parsed content structure
      if (parsedContent.title && parsedContent.html_content && parsedContent.meta_description && Array.isArray(parsedContent.tags)) {
        return parsedContent;
      } else {
        console.error('OpenAI response JSON structure is invalid:', parsedContent);
        return null;
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError, '\nRaw content:', content);
      return null;
    }

  } catch (error) {
    console.error('Error in generateArticleContentWithOpenAI:', error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get JWT from Authorization header and authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const jwt = authHeader.replace('Bearer ', '');
    
    // Create a new Supabase client for user authentication within the function scope
    // This is important because the supabaseAdmin client uses the service_role key
    // and cannot be used to verify user-specific JWTs directly for auth context.
    // However, for getting user from JWT, service role client is fine.
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Error getting user from JWT:', userError);
      return new Response(JSON.stringify({ error: 'Invalid or expired token', details: userError?.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401, // Unauthorized
      });
    }
    console.log(`Request authenticated for user: ${user.id}`);

    // 2. Get categoryId from request body
    const { categoryId } = await req.json(); 
    console.log(`Received request for categoryId: ${categoryId} by user: ${user.id}`);

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

    if (!category.ai_prompt) {
      return new Response(JSON.stringify({ error: 'AI prompt not set for this category' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 4. Generate article content using OpenAI
    const aiModelToUse = category.ai_model || 'gpt-4.1-nano'; 
    const generatedContent = await generateArticleContentWithOpenAI(category.ai_prompt, category.name, aiModelToUse);

    if (!generatedContent) {
      return new Response(JSON.stringify({ error: 'Failed to generate article content with OpenAI' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 5. Create a slug (basic version)
    const slug = generatedContent.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-5);
    // TODO: Implement more robust slug generation and uniqueness check

    // 6. Fetch and store image from Pexels (using article title or category name as query)
    const imageQuery = generatedContent.title || category.name;
    const imageData = await fetchAndStoreImage(imageQuery, slug);

    // 7. Prepare article payload
    const articlePayload: ArticlePayload = {
      title: generatedContent.title,
      content: generatedContent.html_content,
      category_id: category.id,
      author_id: user.id, 
      slug: slug,
      status: 'draft', 
      meta_description: generatedContent.meta_description,
      tags: generatedContent.tags,
      featured_image_url: imageData?.publicUrl,
      featured_image_alt: imageData?.altText,
      generated_by_ai: true,
    };

    // 8. Insert article into Supabase
    const { data: newArticle, error: insertError } = await supabaseAdmin
      .from('articles')
      .insert(articlePayload)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting article:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save the generated article.', details: insertError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Article generated successfully!', article: newArticle }), {
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

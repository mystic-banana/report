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

console.log('Generate AI Article Function Initialized - With DALL-E 2 Support');

// Define interfaces for API responses and data structures
interface Category {
  id: string;
  name: string;
  ai_prompt: string | null;
  ai_model: string | null;
  content_structure?: ContentTemplate;
  output_format?: string;
  image_generation_strategy?: string;
  image_style?: string;
  image_prompt_template?: string;
}

// New interfaces for template handling
interface ContentTemplate {
  format: string;
  sections: string[];
  max_recipes_per_article?: number;
  // Other format-specific settings
}

interface CategorySettings {
  content_structure: ContentTemplate;
  output_format: string;
  image_generation_strategy: string;
  image_style?: string;
  image_prompt_template?: string;
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
  image_prompt?: string;
}

// Recipe-specific interfaces
interface RecipeOutput {
  title: string;
  introduction: string;
  health_benefits: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  nutrition_facts: string;
  tips: string;
  image_prompt: string;
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
    
    // Download the image from Pexels
    const imageResponse = await fetch(photo.src.large);
    if (!imageResponse.ok) {
      console.error(`Failed to download Pexels image: ${imageResponse.status}`);
      return null;
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const imagePath = `article-images/${articleSlug}-${timestamp}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('public')
      .upload(imagePath, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading image to storage:', uploadError);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('public')
      .getPublicUrl(imagePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      altText: photo.alt || query,
    };
  } catch (error) {
    console.error('Error in fetchAndStoreImage:', error);
    return null;
  }
}

// Function to generate image with DALL-E 2 with 512x512 resolution
async function generateDalleImage(imagePrompt: string, articleSlug: string, imageStyle?: string): Promise<{ publicUrl: string; altText: string } | null> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured. Skipping image fetching.');
    return null;
  }

  try {
    // Enhanced prompt focused on professional food photography
    let enhancedPrompt = `Professional food photography of ${imagePrompt}, top-down view, on a beautiful plate, natural daylight, high resolution, sharp details`;
    
    // Add style if provided
    if (imageStyle) {
      enhancedPrompt += `, ${imageStyle}`;
    }
    
    console.log('Generating DALL-E image with enhanced prompt:', enhancedPrompt);
    
    // Call DALL-E API with 512x512 resolution
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        n: 1,
        size: '512x512',
        model: 'dall-e-2', // Specifically using DALL-E 2
        response_format: 'url',
      }),
    });

    if (!dalleResponse.ok) {
      const errorText = await dalleResponse.text();
      console.error(`DALL-E API error: ${dalleResponse.status} ${errorText}`);
      console.log('Falling back to Pexels for image generation');
      return fetchAndStoreImage(imagePrompt, articleSlug);
    }

    const dalleData = await dalleResponse.json();
    if (!dalleData.data || dalleData.data.length === 0 || !dalleData.data[0].url) {
      console.error('No image URL in DALL-E response:', dalleData);
      console.log('Falling back to Pexels for image generation');
      return fetchAndStoreImage(imagePrompt, articleSlug);
    }

    const imageUrl = dalleData.data[0].url;
    console.log('DALL-E image generated successfully:', imageUrl);

    try {
      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error('Failed to download image from DALL-E');
        console.log('Falling back to Pexels for image generation');
        return fetchAndStoreImage(imagePrompt, articleSlug);
      }

      const imageBlob = await imageResponse.blob();

      // Use a unique filename to avoid cache issues
      const timestamp = Date.now();
      const imagePath = `featured/${articleSlug}-${timestamp}.png`;
      
      console.log('Uploading image to Supabase storage path:', imagePath);
      
      // First, check if we have permission to upload
      const { data: bucketInfo, error: bucketError } = await supabaseAdmin
        .storage
        .getBucket('article-images');
      
      if (bucketError) {
        console.error('Error accessing article-images bucket:', bucketError);
        return fetchAndStoreImage(imagePrompt, articleSlug);
      }
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('article-images')
        .upload(imagePath, imageBlob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading DALL-E image to storage:', uploadError);
        console.log('Falling back to Pexels for image generation');
        return fetchAndStoreImage(imagePrompt, articleSlug);
      }

      console.log('Image uploaded successfully:', uploadData);

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('article-images')
        .getPublicUrl(imagePath);

      console.log('Image public URL:', publicUrlData.publicUrl);

      // Return the image data
      return {
        publicUrl: publicUrlData.publicUrl,
        altText: `${articleSlug} - recipe image`,
      };
    } catch (downloadError) {
      console.error('Error in image processing:', downloadError);
      return fetchAndStoreImage(imagePrompt, articleSlug);
    }
  } catch (error) {
    console.error('Error in generateDalleImage:', error);
    console.log('Falling back to Pexels for image generation');
    return fetchAndStoreImage(imagePrompt, articleSlug);
  }
}

// Function to build dynamic system prompts based on category type
function buildSystemPrompt(category: Category, settings: CategorySettings): string {
  // Base system message for all formats
  let systemMessage = `You are a professional content writer creating an article for the "${category.name}" category.\n`;
  systemMessage += `Create engaging, informative content formatted in clean HTML.\n`;
  systemMessage += `Your content should be well-structured with appropriate headings (h2, h3), paragraphs, and occasional lists.\n`;
  systemMessage += `Do not include any CSS or JavaScript.\n\n`;

  // Category-specific formatting and content guidelines
  if (category.name === 'Sacred Kitchen') {
    // Define recipe topics
    const sacredKitchenTopics = [
      "Foods That Support the Chakras",
      "Sattvic Diet Recipes for Yogic Clarity",
      "Ayurvedic Meals for Dosha Balancing",
      "Third Eye Activating Foods",
      "Meditation-Friendly Meals",
      "Lunar-Inspired Recipes for Full Moon & New Moon Rituals",
      "Kundalini Awakening Foods",
      "Crystal-Inspired Healing Recipes",
      "Cleansing Recipes for Spiritual Detox",
      "Sacred Fasting & Conscious Eating Recipes"
    ];
    
    // Select a random topic
    const selectedTopic = sacredKitchenTopics[Math.floor(Math.random() * sacredKitchenTopics.length)];
    
    systemMessage += `For Sacred Kitchen articles, create a focused recipe post under the theme: "${selectedTopic}"\n\n`;
    systemMessage += `VERY IMPORTANT INSTRUCTIONS FOR STRUCTURE AND FORMAT:\n`;
    systemMessage += `1. Title: Create a SHORT, CLEAR title (4-6 words) that directly states what the dish is, like "Peanut Butter Banana Smoothie" or "Grilled Shrimp With Old Bay and Aioli"\n`;
    systemMessage += `2. Introduction: Write a BRIEF introduction (3-4 sentences maximum) that explains what the dish is and its spiritual benefits\n`;
    systemMessage += `3. Ingredients: List all ingredients with exact measurements in a bulleted list\n`;
    systemMessage += `4. Preparation Steps: Provide clear, numbered steps for preparation\n`;
    systemMessage += `5. Final Words: Add a short conclusion (2-3 sentences) about enjoying the dish\n\n`;
    
    systemMessage += `FORMAT RULES:\n`;
    systemMessage += `- Use <h2> tags for main sections: "Ingredients", "Preparation", and "Final Words"\n`;
    systemMessage += `- Use <ul> and <li> tags for the ingredients list\n`;
    systemMessage += `- Use <ol> and <li> tags for the preparation steps\n`;
    systemMessage += `- Keep the entire article concise and practical - no philosophical rambling\n`;
    systemMessage += `- Generate EXACTLY 2 tags that relate SPECIFICALLY to ingredients or dish type\n\n`;
    
    systemMessage += `For the image_prompt: Create a detailed description of the finished dish only, focusing on its appearance, colors, textures, and plating. Describe it as a top-down food photography shot with natural lighting.\n\n`;
  } else if (category.name?.toLowerCase().includes('meditation') || category.name?.toLowerCase().includes('yoga')) {
    systemMessage += `For meditation/yoga articles, structure your content as follows:\n`;
    systemMessage += `1. Begin with an inspiring introduction about the specific practice.\n`;
    systemMessage += `2. Include a 'Benefits' section detailing physical, mental, and spiritual benefits.\n`;
    systemMessage += `3. Provide a 'How to Practice' section with clear, step-by-step instructions.\n`;
    systemMessage += `4. Include tips for beginners and common obstacles to overcome.\n`;
    systemMessage += `5. Conclude with a section on integrating the practice into daily life.\n\n`;
  } else if (settings.content_structure.format === 'recipe') {
    systemMessage += `Create a recipe article with the following structure:\n`;
    systemMessage += `- Title: An engaging, SEO-friendly recipe title\n`;
    systemMessage += `- Introduction: Brief introduction to the recipe\n`;
    systemMessage += `- Health Benefits: Nutritional and health benefits of key ingredients\n`;
    systemMessage += `- Prep Time: Estimated preparation time\n`;
    systemMessage += `- Cook Time: Estimated cooking time\n`;
    systemMessage += `- Servings: Number of servings the recipe yields\n`;
    systemMessage += `- Ingredients: List of all ingredients with measurements\n`;
    systemMessage += `- Instructions: Step-by-step cooking instructions\n`;
    systemMessage += `- Nutrition Facts: Basic nutritional information\n`;
    systemMessage += `- Tips: Optional cooking or serving tips\n`;
    systemMessage += `- Image Prompt: A detailed description for generating a featured image\n\n`;
    
    systemMessage += `Your response must be a JSON object with these exact fields.\n`;
    return systemMessage; // Early return for recipe format
  }

  // Standard article format JSON structure (applies to all categories unless recipe format)
  systemMessage += `Your html_content MUST include proper semantic HTML structure with:\n`;
  systemMessage += `- At least one main heading (h1 or h2)\n`;
  systemMessage += `- Multiple subheadings (h2, h3) to organize content\n`;
  systemMessage += `- Well-structured paragraphs\n`;
  systemMessage += `- Lists where appropriate (ul, li)\n`;
  systemMessage += `- No external CSS or JavaScript\n\n`;
  
  systemMessage += `Your response must be a JSON object with the following structure:\n`;
  systemMessage += `{\n`;
  systemMessage += `  "title": "An engaging, SEO-friendly title",\n`;
  systemMessage += `  "html_content": "The full article content in clean HTML format",\n`;
  systemMessage += `  "meta_description": "A compelling meta description under 160 characters",\n`;
  systemMessage += `  "tags": ["tag1", "tag2", "tag3"],\n`;
  systemMessage += `  "image_prompt": "A detailed description for generating a featured image"\n`;
  systemMessage += `}\n\n`;
  
  // Image prompt guidance
  systemMessage += `For the image_prompt, create a VERY detailed description (at least 30 words) that would help generate a compelling featured image. Include specific details about subject matter, mood, lighting, colors, and composition that aligns with the article content. The more detailed and specific your image prompt is, the better the featured image will be.`;

  return systemMessage;
}

// Function to transform recipe format to article
function transformRecipeToArticleFormat(recipeData: RecipeOutput): OpenAIArticleOutput {
  // Generate HTML content from recipe data
  const htmlContent = `
    <article class="recipe">
      <section class="recipe-intro">
        <p>${recipeData.introduction}</p>
        <div class="recipe-meta">
          <div class="recipe-meta-item">
            <strong>Prep Time:</strong> ${recipeData.prep_time}
          </div>
          <div class="recipe-meta-item">
            <strong>Cook Time:</strong> ${recipeData.cook_time}
          </div>
          <div class="recipe-meta-item">
            <strong>Servings:</strong> ${recipeData.servings}
          </div>
        </div>
      </section>

      <section class="recipe-health-benefits">
        <h2>Health Benefits</h2>
        <p>${recipeData.health_benefits}</p>
      </section>

      <section class="recipe-ingredients">
        <h2>Ingredients</h2>
        <ul>
          ${recipeData.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
      </section>

      <section class="recipe-instructions">
        <h2>Instructions</h2>
        <ol>
          ${recipeData.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </section>

      <section class="recipe-nutrition">
        <h2>Nutrition Information</h2>
        <p>${recipeData.nutrition_facts}</p>
      </section>

      <section class="recipe-tips">
        <h2>Tips</h2>
        <p>${recipeData.tips}</p>
      </section>
    </article>
  `;

  // Generate tags based on recipe content
  const tags = generateTagsFromRecipe(recipeData);

  return {
    title: recipeData.title,
    html_content: htmlContent,
    meta_description: `${recipeData.title} - ${recipeData.introduction.slice(0, 100)}...`,
    tags: tags,
    image_prompt: recipeData.image_prompt
  };

  // Generate tags based on recipe content
  function generateTagsFromRecipe(recipe: RecipeOutput): string[] {
    const baseTags = ['plant-based', 'vegan', 'recipe'];
    
    // Extract potential tags from title
    const titleWords = recipe.title.toLowerCase().split(' ');
    const ingredientWords = recipe.ingredients.join(' ').toLowerCase().split(' ');
    
    // Find key ingredients or cooking methods
    const potentialTags = [...titleWords, ...ingredientWords].filter(word => 
      word.length > 3 && !['with', 'and', 'the', 'for', 'from', 'that', 'this'].includes(word)
    );
    
    // Deduplicate and take up to 5 tags
    const uniqueTags = [...new Set([...baseTags, ...potentialTags])];
    return uniqueTags.slice(0, 8);
  }
}

// Helper function to generate article content with OpenAI
async function generateArticleContentWithOpenAI(
  prompt: string, 
  categoryName: string, 
  categorySettings: CategorySettings,
  model: string = "gpt-4-turbo-preview"
): Promise<OpenAIArticleOutput | null> { 
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured.');
    return null;
  }

  // Build appropriate system message based on category type
  const systemMessage = buildSystemPrompt({ name: categoryName, id: '', ai_prompt: null, ai_model: null }, categorySettings);
  
  const userPrompt = `Category: ${categoryName}\nUser's Core Prompt: ${prompt}`;

  try {
    console.log(`Generating content with OpenAI model: ${model}`);
    console.log('System message length:', systemMessage.length);
    console.log('User prompt:', userPrompt);
    
    // Validate model name - use fallback if needed
    let modelToUse = model;
    if (model === 'gpt-4.1-nano' || !model) {
      console.log(`⚠️ Invalid or missing model name: ${model}, falling back to gpt-4.1-mini-2025-04-14`);
      modelToUse = 'gpt-4.1-mini-2025-04-14';
    }
    
    console.log(`Using model: ${modelToUse}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelToUse, 
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenAI response did not contain content.');
      throw new Error('OpenAI response did not contain content');
    }

    console.log('Successfully received content from OpenAI');
    
    // Attempt to parse the JSON string content
    try {
      const parsedContent = JSON.parse(content);
      console.log('Successfully parsed JSON response');
      
      // If recipe format, convert the structured JSON to appropriate HTML content
      if (categorySettings?.content_structure?.format === 'recipe') {
        console.log('Processing recipe format');
        // Transform the recipe JSON into HTML
        const recipeOutput = parsedContent as RecipeOutput;
        if (recipeOutput.title && recipeOutput.ingredients && recipeOutput.instructions) {
          return transformRecipeToArticleFormat(recipeOutput);
        } else {
          console.error('Recipe output missing required fields:', recipeOutput);
          throw new Error('Recipe output missing required fields');
        }
      }
      
      // For standard article format
      if (parsedContent.title && parsedContent.html_content && parsedContent.meta_description && Array.isArray(parsedContent.tags)) {
        console.log('Successfully validated article format');
        return parsedContent as OpenAIArticleOutput;
      } else {
        console.error('OpenAI response JSON structure is invalid:', parsedContent);
        throw new Error('OpenAI response JSON structure is invalid');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError, '\nRaw content:', content);
      throw new Error(`Failed to parse OpenAI JSON response: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Error in generateArticleContentWithOpenAI:', error);
    throw error; // Re-throw to handle in the main function
  }
}

// Main Edge Function handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  console.log('Received request to generate AI article - DALL-E 2 Enabled');

  try {
    // Get the request body
    let category_id;
    let model;
    
    try {
      const requestBody = await req.json();
      category_id = requestBody.category_id;
      model = requestBody.model; // Optional model override
      console.log('Request parameters:', { category_id, model });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

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

    // 3. Get category details from Supabase
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

    if (!category.ai_prompt) {
      return new Response(JSON.stringify({ error: 'AI prompt not set for this category' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Parse the content structure JSONB field
    const categorySettings: CategorySettings = {
      content_structure: category.content_structure || { format: 'article', sections: ['title', 'content'] },
      output_format: category.output_format || 'html',
      image_generation_strategy: category.image_generation_strategy || 'pexels',
      image_style: category.image_style,
      image_prompt_template: category.image_prompt_template
    };

    // 4. Generate article content with the updated function
    // Use the model from the request if provided, otherwise use the category model or fallback
    const aiModelToUse = model || category.ai_model || 'gpt-4.1-mini-2025-04-14'; 
    console.log(`Using AI model: ${aiModelToUse}`);
    
    let generatedContent;
    try {
      generatedContent = await generateArticleContentWithOpenAI(
        category.ai_prompt,
        category.name,
        categorySettings,
        aiModelToUse
      );
    } catch (error) {
      console.error('Error generating content:', error.message);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate article content', 
        details: error.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!generatedContent) {
      return new Response(JSON.stringify({ error: 'Failed to generate article content with OpenAI' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 5. Create a slug (basic version)
    const slug = generatedContent.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-5);

    // 6. Generate image based on strategy
    let imageData;
    console.log('Image generation strategy:', categorySettings.image_generation_strategy);
    
    if ((categorySettings.image_generation_strategy === 'dalle' || categorySettings.image_generation_strategy === 'mixed') 
        && generatedContent.image_prompt) {
      console.log('Using DALL-E for image generation with prompt:', generatedContent.image_prompt);
      imageData = await generateDalleImage(
        generatedContent.image_prompt, 
        slug,
        categorySettings.image_style
      );
    } else {
      // Fallback to Pexels
      console.log('Using Pexels for image generation with query:', generatedContent.title || category.name);
      imageData = await fetchAndStoreImage(generatedContent.title || category.name, slug);
    }

    // 7. Prepare article payload
    const articlePayload: ArticlePayload = {
      title: generatedContent.title,
      content: generatedContent.html_content,
      category_id: category.id,
      author_id: user.id, 
      slug: slug,
      status: 'published', // Set to published instead of draft
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

    return new Response(JSON.stringify({ 
      message: 'Article generated successfully!', 
      article: newArticle,
      content_format: categorySettings.content_structure.format,
      image_source: imageData?.publicUrl ? (categorySettings.image_generation_strategy === 'dalle' ? 'DALL-E' : 'Pexels') : 'None'
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

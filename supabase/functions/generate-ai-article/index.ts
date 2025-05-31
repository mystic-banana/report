// Modern AI Article Generation System for Mystic Banana
// Redesigned with category-specific layouts, improved prompting, and GPT-4.1 Mini

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log("🚀 Modern AI Article Generator - GPT-4.1 Mini Powered");

// Enhanced interfaces for modern article generation
interface CategoryConfig {
  id: string;
  name: string;
  ai_prompt: string;
  content_structure: {
    format: string;
    layout_type: string;
    sections: string[];
    max_word_count: number;
    min_word_count: number;
    recipe_specific?: {
      include_prep_time: boolean;
      include_cook_time: boolean;
      include_servings: boolean;
      include_nutrition: boolean;
    };
  };
  seo_settings: {
    title_max_length: number;
    meta_description_max_length: number;
    content_tone: string;
    target_audience: string;
  };
  image_generation_strategy: string;
  image_style: string;
  layout_config: {
    hero_style: string;
    card_layout: string;
    color_scheme: string;
  };
}

interface ModernArticleOutput {
  title: string;
  html_content: string;
  meta_description: string;
  tags: string[];
  image_prompt: string;
  content_quality_score: number;
  seo_score: number;
  word_count: number;
}

interface RecipeArticleOutput {
  title: string;
  introduction: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  tips: string;
  image_prompt: string;
}

// Environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

// Initialize Supabase client
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Modern prompt engineering system
class ModernPromptEngine {
  static buildCategoryPrompt(category: CategoryConfig): string {
    const basePrompt = `You are an expert content creator for "${category.name}" at Mystic Banana, a modern spiritual magazine.

CONTENT REQUIREMENTS:
- Target audience: ${category.seo_settings.target_audience}
- Content tone: ${category.seo_settings.content_tone}
- Word count: ${category.content_structure.min_word_count}-${category.content_structure.max_word_count} words
- Layout type: ${category.content_structure.layout_type}

SEO REQUIREMENTS:
- Title: Maximum ${category.seo_settings.title_max_length} characters, SEO-optimized
- Meta description: Maximum ${category.seo_settings.meta_description_max_length} characters
- Include 3-5 relevant tags

`;

    // Category-specific instructions
    switch (category.content_structure.format) {
      case "recipe":
        return basePrompt + this.getRecipePrompt();
      case "guide":
        return basePrompt + this.getGuidePrompt();
      case "insight":
        return basePrompt + this.getInsightPrompt();
      default:
        return basePrompt + this.getStandardPrompt();
    }
  }

  static getRecipePrompt(): string {
    return `RECIPE FORMAT REQUIREMENTS:
Create a spiritual/wellness recipe article with this EXACT structure:

1. TITLE: Short, descriptive recipe name (4-6 words max)
   Example: "Golden Turmeric Healing Latte" NOT "A Comprehensive Guide to Making the Most Amazing Golden Turmeric Healing Latte for Spiritual Wellness"

2. INTRODUCTION: 2-3 sentences about the recipe's spiritual/wellness benefits

3. INGREDIENTS: List with exact measurements

4. INSTRUCTIONS: Clear, numbered steps (5-8 steps max)

5. TIPS: 1-2 practical cooking tips

IMAGE PROMPT: Describe the finished dish for food photography - top-down view, natural lighting, beautiful plating.

Your response must be valid JSON with these exact fields:
{
  "title": "Recipe Name",
  "introduction": "Brief intro...",
  "prep_time": "X minutes",
  "cook_time": "X minutes", 
  "servings": "X servings",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["Step 1", "Step 2"],
  "tips": "Helpful tips...",
  "image_prompt": "Detailed food photography description"
}

KEEP IT CONCISE AND PRACTICAL!`;
  }

  static getGuidePrompt(): string {
    return `GUIDE FORMAT REQUIREMENTS:
Create a practical spiritual guide with this structure:

1. TITLE: Clear, actionable title (under 60 characters)
2. INTRODUCTION: What the reader will learn (2-3 sentences)
3. BENEFITS: 3-4 key benefits in bullet points
4. PRACTICE STEPS: 4-6 clear, actionable steps
5. CONCLUSION: Encouragement to practice (1-2 sentences)

Write in second person ("you"). Be practical, not philosophical.

Your response must be valid JSON:
{
  "title": "Guide Title",
  "html_content": "<h2>Introduction</h2><p>...</p><h2>Benefits</h2><ul><li>...</li></ul><h2>Practice Steps</h2><ol><li>...</li></ol><h2>Conclusion</h2><p>...</p>",
  "meta_description": "Brief description under 150 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "image_prompt": "Serene meditation or spiritual practice scene"
}`;
  }

  static getInsightPrompt(): string {
    return `INSIGHT FORMAT REQUIREMENTS:
Create a mystical insight article with this structure:

1. TITLE: Intriguing, mystical title (under 55 characters)
2. OVERVIEW: What this insight reveals (2-3 sentences)
3. KEY INSIGHTS: 3-4 main points with practical applications
4. PRACTICAL ADVICE: How to apply this knowledge (2-3 actionable tips)

Focus on practical mysticism, not abstract philosophy.

Your response must be valid JSON:
{
  "title": "Insight Title",
  "html_content": "<h2>Overview</h2><p>...</p><h2>Key Insights</h2><ul><li>...</li></ul><h2>Practical Advice</h2><p>...</p>",
  "meta_description": "Brief description under 150 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "image_prompt": "Mystical, cosmic imagery with deep purples and golds"
}`;
  }

  static getStandardPrompt(): string {
    return `ARTICLE FORMAT REQUIREMENTS:
Create an engaging spiritual article with this structure:

1. TITLE: Compelling, SEO-friendly title (under 60 characters)
2. INTRODUCTION: Hook the reader (2-3 sentences)
3. MAIN CONTENT: 3-4 key points with practical value
4. CONCLUSION: Call to action or reflection (1-2 sentences)

Write conversationally. Be helpful, not preachy.

Your response must be valid JSON:
{
  "title": "Article Title",
  "html_content": "<h2>Introduction</h2><p>...</p><h2>Main Content</h2><p>...</p><h2>Conclusion</h2><p>...</p>",
  "meta_description": "Brief description under 150 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "image_prompt": "Modern, inspiring spiritual imagery"
}`;
  }
}

// Enhanced DALL-E image generation
async function generateModernImage(
  imagePrompt: string,
  articleSlug: string,
  imageStyle: string,
): Promise<{ publicUrl: string; altText: string } | null> {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OpenAI API key not configured");
    return null;
  }

  try {
    // Enhanced prompt with style
    const enhancedPrompt = `${imagePrompt}, ${imageStyle}, high quality, professional photography, 4K resolution`;

    console.log(
      "🎨 Generating DALL-E image:",
      enhancedPrompt.substring(0, 100) + "...",
    );

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024", // Upgraded to higher resolution
          model: "dall-e-3", // Upgraded to DALL-E 3
          quality: "standard",
          response_format: "url",
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ DALL-E API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    if (!data.data?.[0]?.url) {
      console.error("❌ No image URL in DALL-E response");
      return null;
    }

    const imageUrl = data.data[0].url;
    console.log("✅ DALL-E image generated successfully");

    // Download and upload to Supabase Storage
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error("❌ Failed to download generated image");
      return null;
    }

    const imageBlob = await imageResponse.blob();
    const timestamp = Date.now();
    const imagePath = `ai-generated/${articleSlug}-${timestamp}.png`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("article-images")
      .upload(imagePath, imageBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Error uploading image:", uploadError);
      return null;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("article-images")
      .getPublicUrl(imagePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      altText: `${articleSlug} - AI generated featured image`,
    };
  } catch (error) {
    console.error("❌ Error in generateModernImage:", error);
    return null;
  }
}

// Modern content generation with GPT-4.1 Mini
async function generateModernContent(
  category: CategoryConfig,
): Promise<ModernArticleOutput | RecipeArticleOutput | null> {
  if (!OPENAI_API_KEY) {
    console.error("❌ OpenAI API key not configured");
    return null;
  }

  const systemPrompt = ModernPromptEngine.buildCategoryPrompt(category);
  const userPrompt = `Category: ${category.name}\n\nCore Prompt: ${category.ai_prompt}\n\nGenerate content following the exact format requirements above.`;

  try {
    console.log("🤖 Generating content with GPT-4.1 Mini...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini-2025-04-14", // Only use GPT-4.1 Mini
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000, // Reduced for more focused content
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    console.log("✅ Content generated successfully");

    return parsedContent;
  } catch (error) {
    console.error("❌ Error generating content:", error);
    throw error;
  }
}

// Transform recipe output to article format
function transformRecipeToArticle(
  recipe: RecipeArticleOutput,
): ModernArticleOutput {
  const htmlContent = `
    <div class="recipe-article">
      <div class="recipe-intro">
        <p>${recipe.introduction}</p>
      </div>
      
      <div class="recipe-meta">
        <div class="recipe-stats">
          <span class="prep-time"><strong>Prep:</strong> ${recipe.prep_time}</span>
          <span class="cook-time"><strong>Cook:</strong> ${recipe.cook_time}</span>
          <span class="servings"><strong>Serves:</strong> ${recipe.servings}</span>
        </div>
      </div>

      <div class="recipe-content">
        <h2>Ingredients</h2>
        <ul class="ingredients-list">
          ${recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}
        </ul>

        <h2>Instructions</h2>
        <ol class="instructions-list">
          ${recipe.instructions.map((instruction) => `<li>${instruction}</li>`).join("")}
        </ol>

        <div class="recipe-tips">
          <h3>Tips</h3>
          <p>${recipe.tips}</p>
        </div>
      </div>
    </div>
  `;

  // Generate tags from recipe content
  const tags = [
    "recipe",
    "sacred-kitchen",
    ...recipe.ingredients
      .slice(0, 2)
      .map((ing) => ing.split(" ")[0].toLowerCase()),
  ].slice(0, 5);

  return {
    title: recipe.title,
    html_content: htmlContent,
    meta_description: `${recipe.title} - ${recipe.introduction.substring(0, 120)}...`,
    tags,
    image_prompt: recipe.image_prompt,
    content_quality_score: 85,
    seo_score: 80,
    word_count: htmlContent.split(" ").length,
  };
}

// Calculate content quality score
function calculateQualityScore(content: ModernArticleOutput): number {
  let score = 50; // Base score

  // Title quality
  if (content.title.length >= 30 && content.title.length <= 60) score += 15;
  if (content.title.includes(" ")) score += 5; // Has spaces (not single word)

  // Content length
  if (content.word_count >= 300 && content.word_count <= 800) score += 15;

  // Meta description
  if (
    content.meta_description.length >= 120 &&
    content.meta_description.length <= 155
  )
    score += 10;

  // Tags
  if (content.tags.length >= 3 && content.tags.length <= 5) score += 5;

  return Math.min(score, 100);
}

// Main Edge Function
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("🚀 Modern AI Article Generation Request Received");

  try {
    // Parse request
    const { category_id } = await req.json();

    if (!category_id) {
      return new Response(
        JSON.stringify({ error: "Category ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("✅ User authenticated:", user.id);

    // Fetch enhanced category configuration
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("id", category_id)
      .single();

    if (categoryError || !category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!category.ai_prompt) {
      return new Response(
        JSON.stringify({ error: "AI prompt not configured for this category" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    console.log("📝 Generating content for category:", category.name);

    // Generate content
    const generatedContent = await generateModernContent(category);
    if (!generatedContent) {
      throw new Error("Failed to generate content");
    }

    // Transform recipe format if needed
    let articleContent: ModernArticleOutput;
    if (category.content_structure?.format === "recipe") {
      articleContent = transformRecipeToArticle(
        generatedContent as RecipeArticleOutput,
      );
    } else {
      articleContent = generatedContent as ModernArticleOutput;
    }

    // Calculate quality scores
    const qualityScore = calculateQualityScore(articleContent);
    articleContent.content_quality_score = qualityScore;
    articleContent.seo_score = qualityScore; // Simplified for now

    // Generate slug
    const slug =
      articleContent.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50) +
      "-" +
      Date.now().toString().slice(-5);

    console.log("🎨 Generating featured image...");

    // Generate image
    const imageData = await generateModernImage(
      articleContent.image_prompt,
      slug,
      category.image_style || "modern, clean, professional",
    );

    // Prepare article for database
    const articlePayload = {
      title: articleContent.title,
      content: articleContent.html_content,
      category_id: category.id,
      author_id: user.id,
      slug,
      status: "published",
      meta_description: articleContent.meta_description,
      tags: articleContent.tags,
      featured_image_url: imageData?.publicUrl,
      featured_image_alt: imageData?.altText,
      generated_by_ai: true,
      generation_metadata: {
        model: "gpt-4.1-mini-2025-04-14",
        category_format: category.content_structure?.format,
        generation_timestamp: new Date().toISOString(),
        image_source: imageData ? "dall-e-3" : "none",
      },
      content_quality_score: articleContent.content_quality_score,
      seo_score: articleContent.seo_score,
    };

    console.log("💾 Saving article to database...");

    // Save to database
    const { data: newArticle, error: insertError } = await supabaseAdmin
      .from("articles")
      .insert(articlePayload)
      .select()
      .single();

    if (insertError) {
      console.error("❌ Database error:", insertError);
      throw new Error(`Failed to save article: ${insertError.message}`);
    }

    console.log("✅ Article generated successfully:", newArticle.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Modern AI article generated successfully!",
        article: newArticle,
        metadata: {
          model_used: "gpt-4.1-mini-2025-04-14",
          content_format: category.content_structure?.format,
          quality_score: articleContent.content_quality_score,
          word_count: articleContent.word_count,
          image_generated: !!imageData,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("❌ Generation failed:", error);
    return new Response(
      JSON.stringify({
        error: "Article generation failed",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

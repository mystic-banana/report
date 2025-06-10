// Improved version of the generate-ai-article function with hardcoded recipe structure
// This file contains only the key changes - copy these into the main index.ts file

// 1. Update the system prompt in buildSystemPrompt function for Sacred Kitchen category:
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
  
  // Create a very structured and limited prompt
  systemMessage = `You are creating a short, focused recipe post for the Sacred Kitchen category under the theme: "${selectedTopic}".

STRICT OUTPUT FORMAT REQUIREMENTS:
1. Title: MUST be 4-6 words only, directly stating the dish name like "Peanut Butter Banana Smoothie" or "Turmeric Golden Milk"
2. Introduction: MAXIMUM 3-4 sentences about what the dish is and its spiritual benefits
3. Ingredients: An exact list of ingredients with measurements
4. Preparation: Numbered steps for preparation
5. Final Words: 1-2 sentences conclusion

USE THESE EXACT HTML TAGS:
<h2>Introduction</h2>
<p>[Your brief intro here]</p>

<h2>Ingredients</h2>
<ul>
<li>[ingredient 1]</li>
<li>[ingredient 2]</li>
...
</ul>

<h2>Preparation</h2>
<ol>
<li>[step 1]</li>
<li>[step 2]</li>
...
</ol>

<h2>Final Words</h2>
<p>[Your brief conclusion here]</p>

Your response must be a JSON object with this structure:
{
  "title": "(4-6 words only, just the dish name)",
  "html_content": "(HTML following the EXACT structure above)",
  "meta_description": "(Under 120 characters)",
  "tags": ["(ingredient)", "(dish type)"], (EXACTLY 2 TAGS ONLY)
  "image_prompt": "(Describe ONLY the completed dish as seen from above)"
}`;

  return systemMessage;
}

// 2. Override the generateArticleContentWithOpenAI function to force proper format:
// Add this to the end of the generateArticleContentWithOpenAI function before the return statement
if (category.name === 'Sacred Kitchen' && parsedContent) {
  console.log('Enforcing Sacred Kitchen recipe format and tag limits');
  
  // Limit tags to exactly 2
  if (Array.isArray(parsedContent.tags) && parsedContent.tags.length > 2) {
    parsedContent.tags = parsedContent.tags.slice(0, 2);
  }
  
  // Check that the response format somewhat matches our expected structure
  const expectedSections = ['Introduction', 'Ingredients', 'Preparation', 'Final Words'];
  let content = parsedContent.html_content || '';
  
  // Ensure title is short (4-6 words)
  let title = parsedContent.title || '';
  if (title.split(' ').length > 6) {
    // Truncate to 6 words
    title = title.split(' ').slice(0, 6).join(' ');
    parsedContent.title = title;
  }
  
  // Check if we need to enforce structure
  let enforceStructure = false;
  for (const section of expectedSections) {
    if (!content.includes(`<h2>${section}</h2>`)) {
      enforceStructure = true;
      break;
    }
  }
  
  if (enforceStructure) {
    console.log('Structure incorrect, enforcing standard recipe format');
    
    // Extract what we can from the content
    let intro = '', ingredients = [], preparation = [], conclusion = '';
    
    // Try to extract sections from the original content if possible
    if (content.includes('<h2>')) {
      const sections = content.split('<h2>');
      
      for (const section of sections) {
        const lowerSection = section.toLowerCase();
        if (lowerSection.includes('introduction') || lowerSection.includes('about')) {
          intro = section.split('</h2>')[1]?.split('<h2>')[0] || '';
        } else if (lowerSection.includes('ingredients')) {
          const ingredientText = section.split('</h2>')[1]?.split('<h2>')[0] || '';
          if (ingredientText.includes('<li>')) {
            ingredients = ingredientText.split('<li>').slice(1).map(i => i.split('</li>')[0]);
          } else {
            // Try to parse ingredients from paragraph
            ingredients = ingredientText.split(',').map(i => i.trim());
          }
        } else if (lowerSection.includes('preparation') || lowerSection.includes('instructions') || lowerSection.includes('steps')) {
          const prepText = section.split('</h2>')[1]?.split('<h2>')[0] || '';
          if (prepText.includes('<li>')) {
            preparation = prepText.split('<li>').slice(1).map(i => i.split('</li>')[0]);
          } else {
            // Try to identify numbered steps
            const steps = prepText.match(/\d+\.\s+[^\d\.]+/g);
            if (steps) {
              preparation = steps.map(s => s.replace(/^\d+\.\s+/, '').trim());
            } else {
              preparation = prepText.split('. ').filter(p => p.trim().length > 10);
            }
          }
        } else if (lowerSection.includes('conclusion') || lowerSection.includes('final')) {
          conclusion = section.split('</h2>')[1]?.split('<h2>')[0] || '';
        }
      }
    }
    
    // If we couldn't extract sections, make some up based on the title
    if (!intro) intro = `<p>This ${title.toLowerCase()} is a nourishing dish that connects body and spirit. It provides both physical nourishment and spiritual energy.</p>`;
    if (ingredients.length === 0) ingredients = ['1 cup main ingredient', '2 tbsp secondary ingredient', '1 tsp spices', 'Optional garnishes'];
    if (preparation.length === 0) preparation = ['Combine main ingredients', 'Mix thoroughly', 'Prepare with intention', 'Serve mindfully'];
    if (!conclusion) conclusion = `<p>Enjoy this ${title.toLowerCase()} as a way to nourish your body and spirit.</p>`;
    
    // Format the content properly
    content = `
<h2>Introduction</h2>
${intro.includes('<p>') ? intro : `<p>${intro}</p>`}

<h2>Ingredients</h2>
<ul>
${ingredients.map(i => `<li>${i}</li>`).join('\n')}
</ul>

<h2>Preparation</h2>
<ol>
${preparation.map(p => `<li>${p}</li>`).join('\n')}
</ol>

<h2>Final Words</h2>
${conclusion.includes('<p>') ? conclusion : `<p>${conclusion}</p>`}
`;
    
    parsedContent.html_content = content;
  }
  
  // Enforce image prompt to focus on the food only
  parsedContent.image_prompt = `Top-down view of ${title}, beautifully plated on a rustic wooden table. Professional food photography with natural lighting highlighting the vibrant colors and textures of the dish.`;
}

// 3. Update the status to published instead of draft:
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

// 4. Enhanced DALLE image generation:
// Enhanced prompt focused on professional food photography
let enhancedPrompt = `Professional food photography of ${imagePrompt}, top-down view, on a beautiful plate, natural daylight, high resolution, sharp details`;

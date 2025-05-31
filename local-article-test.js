// Local test script for article generation
// Run with Node.js to test article generation logic separately from Edge Function

const fetch = require('node-fetch');

// Replace with your actual API keys
const OPENAI_API_KEY = 'your-openai-api-key';
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

// Test article generation with OpenAI
async function generateArticleContent(prompt, categoryName) {
  const systemMessage = `You are an expert content creator specializing in ${categoryName}. 
Create an engaging and informative article based on the provided prompt. 
Return your response as a JSON object with these keys:
"title" (string, catchy and SEO-friendly), 
"html_content" (string, well-structured HTML content with headings, paragraphs, and lists), 
"meta_description" (string, concise, around 150-160 characters), 
"tags" (array of 3-5 relevant string keywords).`;
  
  const userPrompt = `Category: ${categoryName}\nUser's Core Prompt: ${prompt}`;

  try {
    console.log(`Generating article for ${categoryName}...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano', 
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: "json_object" }, 
        temperature: 0.7, 
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenAI API error: ${response.status} ${errorBody}`);
      return null;
    }

    const data = await response.json();
    console.log('OpenAI response received');
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenAI response did not contain content.');
      return null;
    }

    try {
      const parsedContent = JSON.parse(content);
      console.log('Successfully parsed response');
      console.log(`Title: ${parsedContent.title}`);
      console.log(`Meta description length: ${parsedContent.meta_description?.length}`);
      console.log(`HTML content length: ${parsedContent.html_content?.length}`);
      console.log(`Tags: ${parsedContent.tags?.join(', ')}`);
      
      return parsedContent;
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error in generateArticleContent:', error);
    return null;
  }
}

// Run the test
async function runTest() {
  // Get Sacred Kitchen prompt from Supabase (if API key is set)
  let prompt = "Write a well-structured article for Category - Sacred Kitchen of Mystic Banana Spiritual Magazine";
  let categoryName = "Sacred Kitchen";
  
  if (SUPABASE_ANON_KEY !== 'your-supabase-anon-key') {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?id=eq.a204d734-34c1-453a-b8be-bc98dd15f6dd&select=name,ai_prompt`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const [category] = await response.json();
        if (category) {
          prompt = category.ai_prompt;
          categoryName = category.name;
          console.log(`Using prompt from database for category: ${categoryName}`);
        }
      }
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
    }
  }
  
  // Generate article content
  const articleContent = await generateArticleContent(prompt, categoryName);
  
  if (articleContent) {
    console.log('\nArticle generation successful!');
  } else {
    console.log('\nArticle generation failed.');
  }
}

runTest();

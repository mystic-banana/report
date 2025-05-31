// Script to update the Sacred Kitchen category settings
import fetch from 'node-fetch';

// Supabase configuration
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';

// Sacred Kitchen category ID
const SACRED_KITCHEN_ID = 'a204d734-34c1-453a-b8be-bc98dd15f6dd';

async function updateSacredKitchenCategory() {
  console.log('Updating Sacred Kitchen category settings...');
  
  try {
    // First, get the current category details
    const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${SACRED_KITCHEN_ID}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!getResponse.ok) {
      console.error(`Error fetching category: ${getResponse.status} ${getResponse.statusText}`);
      return;
    }
    
    const categories = await getResponse.json();
    if (categories.length === 0) {
      console.error('Sacred Kitchen category not found.');
      return;
    }
    
    const category = categories[0];
    console.log('Current category settings:');
    console.log(JSON.stringify(category, null, 2));
    
    // Update the category settings
    const updatedCategory = {
      // Keep existing fields
      name: category.name,
      ai_prompt: category.ai_prompt,
      
      // Update these fields
      ai_model: 'gpt-4-turbo-preview', // Use a known working model
      image_generation_strategy: 'dalle', // Use DALL-E for image generation
      image_style: 'Professional food photography, vibrant colors, natural lighting', // Add image style
      
      // Add content structure if not present
      content_structure: category.content_structure || {
        format: 'article',
        sections: ['title', 'content']
      }
    };
    
    // Update the category in Supabase
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${SACRED_KITCHEN_ID}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updatedCategory)
    });
    
    if (!updateResponse.ok) {
      console.error(`Error updating category: ${updateResponse.status} ${updateResponse.statusText}`);
      console.error(await updateResponse.text());
      return;
    }
    
    const updatedData = await updateResponse.json();
    console.log('✅ Sacred Kitchen category updated successfully:');
    console.log(JSON.stringify(updatedData, null, 2));
    
    console.log('\nThe Sacred Kitchen category has been updated to use:');
    console.log(`- AI Model: ${updatedCategory.ai_model}`);
    console.log(`- Image Generation: ${updatedCategory.image_generation_strategy}`);
    console.log(`- Image Style: ${updatedCategory.image_style}`);
    console.log('\nPlease try generating an article from the admin panel again.');
    
  } catch (error) {
    console.error('Error updating Sacred Kitchen category:', error.message);
  }
}

// Run the update
updateSacredKitchenCategory().catch(error => {
  console.error('Unhandled error:', error);
});

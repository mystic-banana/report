// Script to update the Sacred Kitchen category to use gpt-4.1-mini-2025-04-14
import fetch from 'node-fetch';

// Supabase configuration
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';

// Sacred Kitchen category ID
const SACRED_KITCHEN_ID = 'a204d734-34c1-453a-b8be-bc98dd15f6dd';

async function updateModelToMini() {
  console.log('Updating Sacred Kitchen category to use gpt-4.1-mini-2025-04-14...');
  
  try {
    // Update the category in Supabase
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${SACRED_KITCHEN_ID}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ai_model: 'gpt-4.1-mini-2025-04-14'
      })
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
    console.log(`- AI Model: gpt-4.1-mini-2025-04-14 (more cost-effective)`);
    console.log('\nPlease try generating an article from the admin panel again.');
    
  } catch (error) {
    console.error('Error updating Sacred Kitchen category:', error.message);
  }
}

// Run the update
updateModelToMini().catch(error => {
  console.error('Unhandled error:', error);
});

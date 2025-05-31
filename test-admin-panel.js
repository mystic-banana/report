// Script to test the article generation from the admin panel
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sacred Kitchen category ID
const SACRED_KITCHEN_ID = 'a204d734-34c1-453a-b8be-bc98dd15f6dd';

// Function to sign in with email and password
async function signIn(email, password) {
  console.log(`Signing in with email: ${email}...`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication failed:', error.message);
      return null;
    }

    console.log('Authentication successful!');
    return data.session.access_token;
  } catch (error) {
    console.error('Error during authentication:', error.message);
    return null;
  }
}

// Function to test the Edge Function
async function testEdgeFunction(token) {
  console.log('\nTesting generate-ai-article Edge Function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ai-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category_id: SACRED_KITCHEN_ID,
        model: 'gpt-4.1-mini-2025-04-14' // Force the correct model
      }),
    });

    // Get the response as text first
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      
      if (response.ok) {
        console.log('✅ Edge Function test successful!');
        console.log('Article title:', responseData.article?.title);
        console.log('Image source:', responseData.image_source);
        console.log('Message:', responseData.message);
      } else {
        console.error('❌ Edge Function test failed with error:', responseData.error);
        if (responseData.details) {
          console.error('Error details:', responseData.details);
        }
      }
    } catch (parseError) {
      // If not valid JSON, show the raw text
      console.error('❌ Edge Function test failed with non-JSON response:', responseText);
    }
  } catch (error) {
    console.error('Error testing Edge Function:', error.message);
  }
}

// Main function
async function main() {
  // Get email and password from command line arguments
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node test-admin-panel.js <email> <password>');
    process.exit(1);
  }
  
  const email = args[0];
  const password = args[1];
  
  // Authenticate
  const token = await signIn(email, password);
  if (!token) {
    console.error('Failed to authenticate. Exiting.');
    process.exit(1);
  }
  
  // Test the Edge Function
  await testEdgeFunction(token);
}

main().catch(error => {
  console.error('Unhandled error:', error);
});

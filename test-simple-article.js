// Test script for the simple-article Edge Function
import fetch from 'node-fetch';

// Supabase configuration
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';

// Sacred Kitchen category ID
const SACRED_KITCHEN_ID = 'a204d734-34c1-453a-b8be-bc98dd15f6dd';

// Function to authenticate and get token
async function authenticate(email, password) {
  console.log(`Authenticating user: ${email}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Authentication failed:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Authentication successful!');
    return data.access_token;
  } catch (error) {
    console.error('Error during authentication:', error.message);
    return null;
  }
}

// Function to test the simple-article Edge Function
async function testSimpleArticleFunction(token) {
  console.log('Testing simple-article Edge Function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/simple-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category_id: SACRED_KITCHEN_ID,
        model: 'gpt-4-turbo-preview' // Force a known working model
      }),
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
      
      if (response.ok) {
        console.log('✅ Test successful!');
      } else {
        console.error('❌ Test failed with error:', responseData.error);
        if (responseData.details) {
          console.error('Error details:', responseData.details);
        }
      }
    } catch (parseError) {
      // If not valid JSON, show the raw text
      console.error('❌ Test failed with non-JSON response:', responseText);
    }
    
  } catch (error) {
    console.error('Error testing Edge Function:', error.message);
  }
}

// Function to test the original generate-ai-article Edge Function
async function testOriginalArticleFunction(token) {
  console.log('\nTesting original generate-ai-article Edge Function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ai-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category_id: SACRED_KITCHEN_ID,
        model: 'gpt-4-turbo-preview' // Force a known working model
      }),
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
      
      if (response.ok) {
        console.log('✅ Test successful!');
      } else {
        console.error('❌ Test failed with error:', responseData.error);
        if (responseData.details) {
          console.error('Error details:', responseData.details);
        }
      }
    } catch (parseError) {
      // If not valid JSON, show the raw text
      console.error('❌ Test failed with non-JSON response:', responseText);
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
    console.error('Usage: node test-simple-article.js <email> <password>');
    process.exit(1);
  }
  
  const email = args[0];
  const password = args[1];
  
  // Authenticate
  const token = await authenticate(email, password);
  if (!token) {
    console.error('Failed to authenticate. Exiting.');
    process.exit(1);
  }
  
  // Test both Edge Functions
  await testSimpleArticleFunction(token);
  await testOriginalArticleFunction(token);
}

main().catch(error => {
  console.error('Unhandled error:', error);
});

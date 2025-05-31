// Test script for the generate-ai-article Edge Function with authentication
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';

// Test user credentials - replace with actual test user credentials
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testArticleGeneration() {
  try {
    console.log('Testing generate-ai-article Edge Function with authentication...');
    
    // Step 1: Sign in to get an access token
    console.log('Signing in to get an access token...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    
    if (authError) {
      console.error('Authentication error:', authError.message);
      console.log('\nPlease provide valid test user credentials. You can set them as environment variables:');
      console.log('export TEST_USER_EMAIL=your-test-email@example.com');
      console.log('export TEST_USER_PASSWORD=your-test-password');
      return;
    }
    
    const accessToken = authData.session.access_token;
    console.log('Successfully authenticated!');
    
    // Step 2: Find the Sacred Kitchen category ID
    console.log('Finding Sacred Kitchen category ID...');
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', '%Sacred Kitchen%')
      .limit(1);
    
    if (categoryError) {
      console.error('Error fetching categories:', categoryError.message);
      return;
    }
    
    if (!categories || categories.length === 0) {
      console.error('Sacred Kitchen category not found.');
      return;
    }
    
    const categoryId = categories[0].id;
    console.log(`Found Sacred Kitchen category with ID: ${categoryId}`);
    
    // Step 3: Call the Edge Function with the access token
    console.log('Calling generate-ai-article Edge Function...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ai-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ category_id: categoryId }),
    });
    
    const responseText = await response.text();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('\nArticle generation successful!');
    } else {
      console.error('\nArticle generation failed.');
    }
  } catch (error) {
    console.error('Error in test script:', error.message);
  }
}

// Run the test
testArticleGeneration();

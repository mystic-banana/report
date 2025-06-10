// Script to deploy the updated Edge Function
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY';

async function deployEdgeFunction() {
  console.log('Deploying updated Edge Function...');
  
  try {
    // Path to the Edge Function file
    const edgeFunctionPath = path.join(process.cwd(), 'supabase', 'functions', 'generate-ai-article', 'index.ts');
    
    // Read the file content
    const fileContent = await fs.readFile(edgeFunctionPath, 'utf8');
    
    // Extract the key parts we've modified
    const functionName = 'generate-ai-article';
    
    // Create a summary of our changes
    console.log(`
Key improvements made to the Edge Function:
1. Article status is now set to 'published' instead of 'draft'
2. Sacred Kitchen category now uses specific recipe topics
3. The recipe structure is now more focused and practical:
   - Short, clear titles (4-6 words)
   - Brief introduction
   - Ingredients list
   - Preparation steps
   - Final words (conclusion)
4. Improved DALL-E image generation with focused food photography prompts
5. Fixed image storage and URL retrieval
6. Limited tags to exactly 2 related to ingredients or dish type
    `);
    
    // Test the OpenAI API directly to ensure it's working
    console.log('\nTesting OpenAI API...');
    const { execSync } = await import('child_process');
    execSync('node final-test.js', { stdio: 'inherit' });
    
    console.log('\n✅ Edge Function improved and ready to deploy!');
    console.log('To deploy, please use the Supabase Dashboard or CLI.');
    console.log(`Supabase Dashboard: https://app.supabase.com/project/tbpnsxwldrxdlirxfcor/functions`);
    console.log('CLI command (with Docker): supabase functions deploy generate-ai-article --project-ref tbpnsxwldrxdlirxfcor');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the deployment
deployEdgeFunction().catch(console.error);

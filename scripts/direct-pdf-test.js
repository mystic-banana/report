// Direct PDF Generation Test Script
import fetch from 'node-fetch';
import fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Test report ID - replace with an actual report ID
const TEST_REPORT_ID = "97f6a1d3-d82b-4f89-a6bd-458943058639"; // Replace with a real ID

async function testPdfGeneration(browser) {
  console.log(`Testing PDF generation with ${browser} configuration...`);
  
  // Create the payload with proper JSON formatting
  const payload = {
    reportId: TEST_REPORT_ID,
    browserInfo: {
      name: browser,
      version: "latest",
      userAgent: `Test user agent for ${browser}`
    },
    options: {
      format: "A4",
      printBackground: true
    }
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-pdf-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.success && data.downloadUrl) {
      console.log(`✅ Success! PDF generated with ${browser} configuration`);
      console.log(`Download URL: ${data.downloadUrl}`);
      return true;
    } else {
      console.log(`❌ Failed to generate PDF with ${browser} configuration`);
      console.log('Error:', data.error);
      console.log('Details:', JSON.stringify(data.errorDetails, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception when testing ${browser}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== Mystic Banana PDF Generation Test ===');
  console.log('Running direct Node.js test to avoid shell escaping issues\n');
  
  // Test with Chrome configuration
  const chromeResult = await testPdfGeneration('Chrome');
  
  // Test with Safari configuration
  const safariResult = await testPdfGeneration('Safari');
  
  // Summary
  console.log('\n=== Test Results ===');
  console.log(`Chrome PDF generation: ${chromeResult ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Safari PDF generation: ${safariResult ? 'SUCCESS' : 'FAILED'}`);
}

runTests().catch(console.error);

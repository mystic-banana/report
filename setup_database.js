import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials from environment (remember to use these safely in production)
const SUPABASE_URL = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODAxNDAzNiwiZXhwIjoyMDYzNTkwMDM2fQ.ssegKhlGyUIH64uWzy_vo5hpr523MSbhpd1ksi0td8c';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Read SQL files
const podcastCategoriesSQL = fs.readFileSync(
  path.join(__dirname, 'create_podcast_categories.sql'),
  'utf8'
);

const adsenseConfigSQL = fs.readFileSync(
  path.join(__dirname, 'create_adsense_config.sql'),
  'utf8'
);

// Function to execute SQL
async function executeSQL(sql, description) {
  console.log(`Executing SQL: ${description}...`);
  try {
    // Execute the SQL query
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error executing SQL: ${description}`);
      console.error(error);
      return false;
    }
    
    console.log(`Successfully executed: ${description}`);
    return true;
  } catch (error) {
    console.error(`Failed to execute ${description}:`, error);
    return false;
  }
}

// Main function to run all setup operations
async function setupDatabase() {
  console.log('Starting database setup...');
  
  // Create podcast categories table and add initial data
  await executeSQL(podcastCategoriesSQL, 'Creating podcast categories table');
  
  // Create adsense configuration
  await executeSQL(adsenseConfigSQL, 'Setting up AdSense configuration');
  
  console.log('Database setup completed!');
}

// Run the setup
setupDatabase()
  .catch(error => {
    console.error('Setup failed:', error);
  });

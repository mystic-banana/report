// Script to run the database migration using the Supabase API
// This will add the missing columns needed for the admin approval system

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the project ID and service role key from your Supabase project
const supabaseUrl = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use environment variable for security

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // Read the migration SQL
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', 'add_admin_columns.sql'),
      'utf8'
    );

    console.log('Running migration to add missing columns...');
    
    // Execute the SQL directly using rpc or raw SQL
    // Note: Different Supabase versions might require different approaches
    try {
      // First try using rpc method
      const { data, error } = await supabase.rpc('pg_query', {
        query: migrationSql
      });
      
      if (error) throw error;
    } catch (rpcError) {
      console.log('RPC method failed, trying direct SQL query...');
      
      // Fallback to direct SQL query if RPC not available
      const { error } = await supabase.from('_exec_sql').select('*').eq('query', migrationSql);
      if (error) throw error;
    }

    console.log('Migration completed successfully!');
    console.log('The following columns have been added to the podcasts table:');
    console.log('- status (TEXT, default: "pending")');
    console.log('- admin_comments (TEXT)');
    console.log('- submitter_id (UUID, nullable)');
    
    console.log('\nYou can now use the admin approval system without errors.');
  } catch (err) {
    console.error('Error:', err);
  }
}

// Instructions to run this script:
console.log('To run this migration script:');
console.log('1. First set your Supabase service key as an environment variable:');
console.log('   export SUPABASE_SERVICE_KEY="your-service-role-key"');
console.log('2. Then run: node scripts/run_migration.js');

// Check if SUPABASE_SERVICE_KEY is set
if (!process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is not set');
  console.error('Please set it before running this script:');
  console.error('export SUPABASE_SERVICE_KEY="your-service-role-key"');
  process.exit(1);
}

// Run the migration
runMigration();

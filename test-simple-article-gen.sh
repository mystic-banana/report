#!/bin/bash

# Script to test the simplified article generation function

# Set your Supabase URL and anon key
SUPABASE_URL="https://tbpnsxwldrxdlirxfcor.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY"

# Run the curl command to test the Edge Function
echo "Testing simplified article generation function..."
curl -X POST "${SUPABASE_URL}/functions/v1/test-article-gen" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a healthy plant-based recipe for a summer salad with quinoa and seasonal vegetables."}'

echo -e "\n\nTest completed!"

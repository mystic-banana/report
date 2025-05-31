#!/bin/bash

# Script to test the debug-openai Edge Function

# Set your Supabase URL and anon key
SUPABASE_URL="https://tbpnsxwldrxdlirxfcor.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY"

# Run the curl command to test the Edge Function
echo "Testing debug-openai Edge Function..."
curl -X GET "${SUPABASE_URL}/functions/v1/debug-openai" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json"

echo -e "\n\nTest completed!"

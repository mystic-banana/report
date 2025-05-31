#!/bin/bash

# Script to test the generate-ai-article Edge Function

# Set your Supabase URL and anon key
SUPABASE_URL="https://tbpnsxwldrxdlirxfcor.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY"

# Get a valid JWT token for authentication
echo "Getting a valid JWT token..."
# For testing purposes, you'll need to login and get a valid JWT token
# This script assumes you have a valid JWT token from the browser

# For now, we'll use the anon key for testing
# In production, you'd use a valid JWT token from an authenticated user

# Find the Sacred Kitchen category ID
echo "Finding Sacred Kitchen category ID..."
SACRED_KITCHEN_ID=$(curl -s "${SUPABASE_URL}/rest/v1/categories?name=eq.Sacred%20Kitchen" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" | jq -r '.[0].id')

if [ -z "$SACRED_KITCHEN_ID" ]; then
  echo "Could not find Sacred Kitchen category. Using default ID."
  SACRED_KITCHEN_ID="5856aa31-bc67-49c2-9947-06295cf95f90"
fi

echo "Using category ID: ${SACRED_KITCHEN_ID}"

# Run the curl command to test the Edge Function
echo "Testing generate-ai-article Edge Function..."
curl -X POST "${SUPABASE_URL}/functions/v1/generate-ai-article" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":\"${SACRED_KITCHEN_ID}\"}"

echo -e "\n\nTest completed!"

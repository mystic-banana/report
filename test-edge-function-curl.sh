#!/bin/bash

# Script to test the generate-ai-article Edge Function with curl

# Set your Supabase URL and anon key
SUPABASE_URL="https://tbpnsxwldrxdlirxfcor.supabase.co"
# Replace with your actual anon key if needed
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjU2MzcsImV4cCI6MjAzMTgwMTYzN30.Nh6Xw6YXpJgWgzfN_0pLiLYeAoGxOAZKSg3GS7JfLJU"

# Category ID for Sacred Kitchen (update this if needed)
CATEGORY_ID="1"

# Create a JWT token for testing (this simulates an authenticated user)
# In a real scenario, you would get this from your auth system
# For testing, we'll use a hardcoded JWT that you would get from your browser

# Run the curl command to test the Edge Function
echo "Testing Edge Function with curl..."
curl -v -X POST "${SUPABASE_URL}/functions/v1/generate-ai-article" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":\"${CATEGORY_ID}\"}"

echo -e "\n\nTest completed!"

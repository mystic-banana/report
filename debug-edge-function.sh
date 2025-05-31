#!/bin/bash

# Script to debug the Edge Function and generate an article directly

# Set your Supabase URL and anon key
SUPABASE_URL="https://tbpnsxwldrxdlirxfcor.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY"

# Find the Sacred Kitchen category ID
echo "Finding Sacred Kitchen category ID..."
SACRED_KITCHEN_ID=$(curl -s "${SUPABASE_URL}/rest/v1/categories?name=ilike.%25Sacred%20Kitchen%25" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" | jq -r '.[0].id')

if [ -z "$SACRED_KITCHEN_ID" ] || [ "$SACRED_KITCHEN_ID" = "null" ]; then
  echo "Could not find Sacred Kitchen category. Let's list all categories:"
  curl -s "${SUPABASE_URL}/rest/v1/categories?select=id,name" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" | jq
  
  echo "Please enter the category ID to use:"
  read SACRED_KITCHEN_ID
fi

echo "Using category ID: ${SACRED_KITCHEN_ID}"

# Get a valid JWT token for authentication
echo "Getting a valid JWT token..."
echo "Please enter your email for Supabase authentication:"
read EMAIL

echo "Please enter your password:"
read -s PASSWORD

# Sign in to get an access token
AUTH_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "Authentication failed. Error: $(echo $AUTH_RESPONSE | jq -r '.error_description // .error')"
  exit 1
fi

echo "Successfully authenticated!"

# Enable verbose output for debugging
echo "Calling Edge Function with verbose output..."
curl -v -X POST "${SUPABASE_URL}/functions/v1/generate-ai-article" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":\"${SACRED_KITCHEN_ID}\"}" | tee response.json

echo -e "\n\nDebug completed! Check response.json for details."

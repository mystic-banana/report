#!/bin/bash

# Get Supabase anonymous key from environment or use default
ANON_KEY=${SUPABASE_ANON_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzYwNjQ5MTEsImV4cCI6MTk1MTY0MDkxMX0.zDXlmVAv5I3Qd4nTbkAJlDfcjNnKX1kHtJOYOj3bKDU"}
PROJECT_REF="tbpnsxwldrxdlirxfcor"

echo "Testing login to get an auth token..."
AUTH_RESPONSE=$(curl -s "https://$PROJECT_REF.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"admin@mysticbanana.com","password":"test1234"}')

# Extract the access token
ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token. Response: $AUTH_RESPONSE"
  echo "Please enter a valid JWT token from your browser (get it from the network tab while using the admin panel):"
  read -s ACCESS_TOKEN
  
  if [ -z "$ACCESS_TOKEN" ]; then
    echo "No token provided. Exiting."
    exit 1
  fi
fi

echo "Got access token: ${ACCESS_TOKEN:0:10}..."

# Test the function with all request/response details
echo "Testing Edge Function with full debug info..."
curl -v "https://$PROJECT_REF.supabase.co/functions/v1/generate-ai-article" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"categoryId":"a204d734-34c1-453a-b8be-bc98dd15f6dd"}' \
  > curl-output.json 2> curl-error.log

echo "Check curl-output.json and curl-error.log for details"

# Let's examine the error logs
echo "Request/response details:"
cat curl-error.log

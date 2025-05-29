#!/bin/bash

# Prompt the user for their Admin JWT
read -p "Enter your Admin User JWT: " ADMIN_JWT

# Check if the JWT is empty
if [ -z "$ADMIN_JWT" ]; then
  echo "No JWT provided. Exiting."
  exit 1
fi

echo "Testing add-podcast-feed with the provided Admin JWT..."

# Curl command
curl -X POST \
  'https://tbpnsxwldrxdlirxfcor.supabase.co/functions/v1/add-podcast-feed' \
  -H "Authorization: Bearer ${ADMIN_JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "feedUrl": "https://feeds.simplecast.com/cL_xMdo5",
    "category": "Web Development"
  }'

echo "" # Add a newline for cleaner output

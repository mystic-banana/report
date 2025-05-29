#!/bin/bash

# Use the JWT we generated
JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3RicG5zeHdsZHJ4ZGxpcnhmY29yLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwOWU5ZDFkZS02NTIyLTQyYjUtOGM3MS05MTQxNGZiNzJjZGMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ4MjU0MjQ4LCJpYXQiOjE3NDgyNTA2NDgsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJteXN0aWNiYW5hbmEyMDEwQGdtYWlsLmNvbSJ9.0Cq64ozlRMCM_oXmFtp4IhSk05YVE_96-SK4CBHCd-k"

echo "Testing add-podcast-feed with the generated JWT..."

# Curl command
curl -X POST \
  'https://tbpnsxwldrxdlirxfcor.supabase.co/functions/v1/add-podcast-feed' \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "feedUrl": "https://feeds.simplecast.com/cL_xMdo5",
    "category": "Web Development"
  }'

echo "" # Add a newline for cleaner output

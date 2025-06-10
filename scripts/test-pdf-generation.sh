#!/bin/bash
# PDF Generation Test Script
# Tests PDF generation across different browsers and reports results

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "=== Mystic Banana PDF Generation Test ==="
echo "This script will test PDF generation functionality across browsers"
echo

# Checking environment
echo "Checking environment..."
SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2)
SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}Error: SUPABASE_URL or SUPABASE_ANON_KEY not found in .env file${NC}"
  echo "Please ensure your .env file contains the necessary Supabase credentials"
  exit 1
fi

echo -e "${GREEN}Environment variables found${NC}"

# Function to get a test report ID from the database
get_test_report_id() {
  echo "Using a test report ID..."
  
  # Using a hardcoded report ID for testing
  # In a real scenario, you would query the database
  REPORT_ID="97f6a1d3-d82b-4f89-a6bd-458943058639" # Replace with an actual report ID if needed
  
  echo -e "${GREEN}Using report ID: $REPORT_ID${NC}"
  echo
  
  # Return the report ID
  echo "$REPORT_ID"
}

# Function to check if PDFs exist in Supabase storage
check_pdf_in_storage() {
  local REPORT_ID=$1
  
  echo "Checking for existing PDFs in Supabase storage..."
  echo -e "${YELLOW}This is a simplified check. In production, use Supabase API to check storage.${NC}"
  echo -e "${YELLOW}Proceeding with PDF generation test...${NC}"
}

# Function to call the Edge Function directly for testing
test_edge_function() {
  local REPORT_ID=$1
  local BROWSER=$2
  local USER_AGENT=$3
  
  echo "Testing PDF generation with $BROWSER..."
  
  # Create a temporary JSON file for the payload to avoid shell escaping issues
  PAYLOAD_FILE=$(mktemp)
  
  # Write properly formatted JSON to the temp file
  cat > "$PAYLOAD_FILE" << EOF
{
  "reportId": "$REPORT_ID",
  "browserInfo": {
    "name": "$BROWSER",
    "version": "latest",
    "userAgent": "Testing user agent for $BROWSER"
  },
  "templateId": null,
  "options": {}
}
EOF
  
  # Call the Edge Function
  echo "Calling Edge Function with $BROWSER configuration..."
  RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d @"$PAYLOAD_FILE" \
    "$SUPABASE_URL/functions/v1/generate-pdf-report")
  
  # Clean up the temp file
  rm "$PAYLOAD_FILE"
  
  # Check if the response contains a download URL
  if echo "$RESPONSE" | grep -q "downloadUrl"; then
    echo -e "${GREEN}Success! PDF generated with $BROWSER configuration${NC}"
    # Extract and display the download URL
    DOWNLOAD_URL=$(echo "$RESPONSE" | grep -o '"downloadUrl":"[^"]*"' | cut -d'"' -f4)
    echo "Download URL: $DOWNLOAD_URL"
    return 0
  else
    echo -e "${RED}Failed to generate PDF with $BROWSER configuration${NC}"
    echo "Error response: $RESPONSE"
    return 1
  fi
}

# Main test flow
echo "Starting PDF generation tests..."
REPORT_ID=$(get_test_report_id)

# Check for existing PDFs
check_pdf_in_storage "$REPORT_ID"

# Test with Chrome configuration
CHROME_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
test_edge_function "$REPORT_ID" "Chrome" "$CHROME_USER_AGENT"
CHROME_RESULT=$?

# Test with Safari configuration
SAFARI_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15"
test_edge_function "$REPORT_ID" "Safari" "$SAFARI_USER_AGENT"
SAFARI_RESULT=$?

# Summary of results
echo
echo "=== Test Results ==="
if [ $CHROME_RESULT -eq 0 ]; then
  echo -e "${GREEN}Chrome PDF generation: SUCCESS${NC}"
else
  echo -e "${RED}Chrome PDF generation: FAILED${NC}"
fi

if [ $SAFARI_RESULT -eq 0 ]; then
  echo -e "${GREEN}Safari PDF generation: SUCCESS${NC}"
else
  echo -e "${RED}Safari PDF generation: FAILED${NC}"
fi

echo
echo "For additional diagnostics, check the Edge Function logs and the debug screenshots"
echo "in the Supabase Storage bucket 'report-pdfs/debug/'"

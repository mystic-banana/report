#!/bin/bash

# Test the Edge Function with direct invocation through the Supabase CLI
echo "Testing Edge Function through Supabase CLI..."

# First, check if we have the Supabase CLI installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found! Installing..."
  brew install supabase/tap/supabase
fi

# Set up the project if needed
if [ ! -f "supabase/config.toml" ]; then
  echo "Initializing Supabase project locally..."
  supabase init
fi

# Now we'll invoke the function directly to see any errors
echo "Invoking generate-ai-article function..."
supabase functions invoke generate-ai-article \
  --project-ref tbpnsxwldrxdlirxfcor \
  --body '{"categoryId":"a204d734-34c1-453a-b8be-bc98dd15f6dd"}' \
  --method POST \
  -u 2>&1 | tee function-output.log

echo "\nTest complete - check function-output.log for details"


#!/bin/bash

# Script to deploy and test the Supabase Edge Function 'generate-ai-article'

PROJECT_REF="tbpnsxwldrxdlirxfcor"
FUNCTION_NAME="generate-ai-article"

echo "-----------------------------------------------------"
echo "Attempting to deploy Edge Function: $FUNCTION_NAME to project $PROJECT_REF..."
echo "-----------------------------------------------------"
supabase functions deploy $FUNCTION_NAME --project-ref $PROJECT_REF

DEPLOY_STATUS=$?
if [ $DEPLOY_STATUS -ne 0 ]; then
  echo "-----------------------------------------------------"
  echo " ERROR: Deployment command failed with status $DEPLOY_STATUS."
  echo "Please check the output above for specific error messages from the Supabase CLI."
  echo "-----------------------------------------------------"
  exit $DEPLOY_STATUS
else
  echo "-----------------------------------------------------"
  echo " SUCCESS: Deployment command completed."
  echo "The function should now be deploying on Supabase."
  echo "Waiting 15 seconds for the function to initialize on the server..."
  sleep 15 
  echo "-----------------------------------------------------"
fi

echo ""
echo "-----------------------------------------------------"
echo "Attempting to invoke the Edge Function: $FUNCTION_NAME with a test payload."
echo "This test checks if the function endpoint is reachable."
echo "An error response from the function (e.g., 'Category not found') is acceptable here, "
echo "as long as it's not a 404 Not Found or a connection error."
echo "-----------------------------------------------------"

# A minimal valid JSON payload structure for your function
DUMMY_PAYLOAD='{"categoryId": "script-test-dummy-category-id", "userId": "script-test-user"}'
TEMP_PAYLOAD_FILE="temp_payload.json"

echo "$DUMMY_PAYLOAD" > "$TEMP_PAYLOAD_FILE"

# Invoke the function using Supabase CLI
# The CLI handles authentication when linked to your project.
supabase functions invoke $FUNCTION_NAME \
  --payload-file "$TEMP_PAYLOAD_FILE"

INVOKE_STATUS=$?

# Clean up the temporary payload file
rm "$TEMP_PAYLOAD_FILE"

echo "-----------------------------------------------------"
if [ $INVOKE_STATUS -ne 0 ]; then
  echo " INFO/ERROR: Invocation command finished with non-zero status $INVOKE_STATUS."
  echo "This could mean:
    1. The function endpoint is still not reachable (e.g., 404, connection error - BAD).
    2. The function was reached but returned an error due to the dummy payload (e.g., 400, 500 with a JSON error message - OK for this test).
  Review the output above carefully."
else
  echo " SUCCESS: Invocation command completed successfully (HTTP 2xx)."
  echo "This suggests the function endpoint is live and responded."
  echo "Review the function's response output above."
fi
echo "-----------------------------------------------------"

echo ""
echo "Script finished."
echo "Next steps based on results:"
echo "1. If deployment failed: Address errors reported by the Supabase CLI."
echo "2. If invocation failed with 404/connection error: The function is likely not deployed correctly or not yet available."
echo "3. If invocation returned a function-specific error (e.g., category not found): The endpoint is working! The CORS issue in the browser might be separate."
echo "4. If invocation was fully successful: The endpoint is working! The CORS issue in the browser might be separate."
echo "5. Always check your Supabase Dashboard for function logs and status."
echo "6. If the endpoint seems to work via CLI, try generating an article from your web application again and re-check the browser's Network Tab."

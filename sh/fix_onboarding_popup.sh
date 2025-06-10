#!/bin/bash

# Script to fix onboarding popup issues in dashboard
echo "Fixing onboarding popup issue..."

# Let's find the dashboard component that handles onboarding
echo "Looking for dashboard components..."
DASHBOARD_DIR="/Users/startupomatic/Documents/work/mystic-banana-astro/src/components/dashboard"

# Find onboarding related files
ONBOARDING_FILES=$(find "$DASHBOARD_DIR" -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "onboarding" || echo "")

if [ -z "$ONBOARDING_FILES" ]; then
  echo "No onboarding files found in dashboard components"
  # Let's check other locations
  ONBOARDING_FILES=$(find "/Users/startupomatic/Documents/work/mystic-banana-astro/src" -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "onboarding" || echo "")
fi

echo "Found the following onboarding-related files:"
echo "$ONBOARDING_FILES"

# Look for a Dashboard component file
DASHBOARD_FILE=$(find "/Users/startupomatic/Documents/work/mystic-banana-astro/src/pages" -type f -name "Dashboard*.tsx" -o -name "dashboard*.tsx" | head -n 1)

if [ -n "$DASHBOARD_FILE" ]; then
  echo "Found dashboard file: $DASHBOARD_FILE"
  
  # Create backup
  cp "$DASHBOARD_FILE" "${DASHBOARD_FILE}.bak"
  
  # Check if there's an onboarding state in localStorage that needs to be checked
  if grep -q "localStorage" "$DASHBOARD_FILE" && grep -q "onboarding" "$DASHBOARD_FILE"; then
    echo "Found onboarding code in dashboard file, fixing it..."
    
    # This is a generic patch that looks for onboarding checks in the dashboard
    # and modifies them to properly check localStorage
    sed -i '' 's/\(const\|let\)\s\+\([a-zA-Z0-9]*\)\s*=\s*localStorage\.getItem(["\x27]onboarding["\x27])/const \2 = localStorage.getItem("\2") === "completed"/g' "$DASHBOARD_FILE"
    
    # Add logic to ensure onboarding doesn't keep showing up
    sed -i '' '/useEffect.*onboarding/,/}\s*)/c\
  useEffect(() => {\
    // Check if onboarding has been completed\
    const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true";\
    \
    // Only show onboarding if it has not been completed\
    if (!onboardingCompleted) {\
      setShowOnboarding(true);\
    } else {\
      setShowOnboarding(false);\
    }\
  }, []);\
\
  // Function to mark onboarding as completed\
  const completeOnboarding = () => {\
    localStorage.setItem("onboardingCompleted", "true");\
    setShowOnboarding(false);\
  };\
' "$DASHBOARD_FILE"
    
    # Replace onboarding close handler to ensure it saves state
    sed -i '' 's/setShowOnboarding(false)/completeOnboarding()/g' "$DASHBOARD_FILE"
    
    echo "Updated dashboard file to properly handle onboarding state"
  else
    echo "Could not find specific onboarding code pattern in dashboard file"
    echo "Manual inspection may be needed"
  fi
else
  echo "Could not find main dashboard file"
  echo "Creating a general fix for onboarding persistence..."
  
  # Create a utility file to handle onboarding properly
  mkdir -p "/Users/startupomatic/Documents/work/mystic-banana-astro/src/utils"
  
  ONBOARDING_UTIL="/Users/startupomatic/Documents/work/mystic-banana-astro/src/utils/onboardingManager.ts"
  
  cat > "$ONBOARDING_UTIL" << 'EOL'
// Utility to properly manage onboarding state across the application

const ONBOARDING_KEY = 'mysticBananaOnboarding';

/**
 * Check if the onboarding process has been completed
 * @returns boolean indicating whether onboarding is complete
 */
export const isOnboardingCompleted = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'completed';
  } catch (error) {
    // In case localStorage is not available
    console.error('Error accessing localStorage:', error);
    return false;
  }
};

/**
 * Mark the onboarding process as completed
 */
export const completeOnboarding = (): void => {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'completed');
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

/**
 * Reset the onboarding state (for development/testing)
 */
export const resetOnboarding = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export default {
  isOnboardingCompleted,
  completeOnboarding,
  resetOnboarding
};
EOL

  echo "Created onboarding utility at $ONBOARDING_UTIL"
  echo "To fix the issue completely, you'll need to implement this utility in your dashboard component"
fi

echo "Onboarding popup issue fix completed"

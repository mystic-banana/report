#!/bin/bash

# Script to fix dashboard onboarding popup persistence issue
echo "Fixing dashboard onboarding popup persistence issue..."

DASHBOARD_FILE="/Users/startupomatic/Documents/work/mystic-banana-astro/src/pages/dashboard/DashboardPage.tsx"

# Create backup
cp "$DASHBOARD_FILE" "${DASHBOARD_FILE}.bak"

# Fix the onboarding issue by ensuring the onComplete callback is properly called
# when the onboarding modal is closed
echo "Modifying OnboardingTour component usage..."

# This pattern replaces the onClose handler to also call the onComplete function
sed -i '' 's/<OnboardingTour\n        isOpen={showOnboarding}\n        onClose={() => setShowOnboarding(false)}\n        onComplete={handleOnboardingComplete}\n      \/>/<OnboardingTour\n        isOpen={showOnboarding}\n        onClose={() => {\n          setShowOnboarding(false);\n          handleOnboardingComplete();\n        }}\n        onComplete={handleOnboardingComplete}\n      \/>/g' "$DASHBOARD_FILE"

# Check if we need to modify the OnboardingTour component itself
ONBOARDING_TOUR_FILE="/Users/startupomatic/Documents/work/mystic-banana-astro/src/components/dashboard/OnboardingTour.tsx"

if [ -f "$ONBOARDING_TOUR_FILE" ]; then
  echo "Found OnboardingTour component, checking implementation..."
  
  # Create backup
  cp "$ONBOARDING_TOUR_FILE" "${ONBOARDING_TOUR_FILE}.bak"
  
  # Check if there's a close button without onComplete callback
  if grep -q "onClose()" "$ONBOARDING_TOUR_FILE"; then
    echo "Found close handler in OnboardingTour component, fixing it..."
    
    # Modify close handlers to also call onComplete
    sed -i '' 's/onClose()/onComplete(); onClose()/g' "$ONBOARDING_TOUR_FILE"
  fi
fi

echo "Dashboard onboarding popup issue fixed"

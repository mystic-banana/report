#!/bin/zsh
# Script to ensure Supabase CLI is installed, instance is running, and apply migrations.

echo "Starting Supabase migration process..."

# Source NVM (important for scripts to find npm/node, though not for brew)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
  if ! nvm use --lts --silent; then
    echo "NVM LTS not set, trying to install/use..."
    nvm install --lts
    nvm use --lts
  fi
  echo "Using Node $(node -v) and npm $(npm -v)"
else
  echo "Warning: NVM script not found. This might be okay if Node/npm are not strictly needed by Supabase CLI installed via other means."
fi

# Explicitly add common Homebrew paths to the script's PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
echo "Updated script PATH: $PATH"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found."
  # Check for Homebrew
  if command -v brew &> /dev/null; then
    echo "Homebrew is installed. Attempting to install Supabase CLI via Homebrew..."
    brew install supabase/tap/supabase
    if ! command -v supabase &> /dev/null; then
      echo "Error: Supabase CLI installation via Homebrew failed or it's not in PATH."
      echo "Please check Homebrew output, or try installing manually from https://github.com/supabase/cli#install-the-cli"
      exit 1
    fi
    echo "Supabase CLI installed successfully via Homebrew."
  else
    echo "Error: Homebrew (brew) is not installed, and Supabase CLI is not found."
    echo "Please install Homebrew first (see https://brew.sh/), then re-run this script,"
    echo "OR install Supabase CLI manually using a different method from https://github.com/supabase/cli#install-the-cli"
    exit 1
  fi
else
  echo "Supabase CLI is already installed. Version: $(supabase --version)"
fi

# Navigate to the project root directory (where supabase project is initialized)
if [ -d "../supabase" ]; then
  cd ..
  echo "Changed directory to project root: $(pwd)"
elif [ -d "./supabase" ]; then # Check if already in project root
  echo "Already in project root or a directory containing 'supabase'."
else
  echo "Error: Could not find supabase project directory. Ensure script is in 'sh' or project root, and project root contains 'supabase' folder."
  exit 1
fi

# Stop existing Supabase instance and clear data for a clean start
echo "Stopping any existing local Supabase instance and clearing data..."
supabase stop --no-backup
echo "Previous instance stopped and data cleared."

# Start Supabase services
echo "Attempting to start Supabase services..."
supabase start
  if [ $? -ne 0 ]; then
    echo "Error starting Supabase services. Please check Supabase CLI logs."
    exit 1
  fi
  echo "Supabase services started successfully."

echo "Applying database migrations..."
supabase migration up

if [ $? -eq 0 ]; then
  echo "Supabase migration applied successfully."
else
  echo "Error applying Supabase migration. Please check the output above."
  exit 1
fi

echo "Next, I will update create_categories.sql."
exit 0

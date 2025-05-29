#!/bin/zsh
# Script to attempt to fix react-quill installation issues

echo "Attempting to fix react-quill installation..."

# Source NVM (important for scripts)
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
  echo "Error: NVM script not found. Ensure NVM is installed and configured."
  exit 1
fi

echo "1. Cleaning npm cache..."
npm cache clean --force

if [ $? -ne 0 ]; then
  echo "Error cleaning npm cache. Please check for errors."
  # exit 1 # Continue to next step even if cache clean fails, as it's not always critical
fi

echo "2. Removing existing react-quill from node_modules (if present)..."
rm -rf node_modules/react-quill

echo "3. Attempting to reinstall react-quill..."
npm install react-quill

if [ $? -eq 0 ]; then
  echo "react-quill reinstallation attempt complete."
  echo "Please check if node_modules/react-quill/dist/quill.snow.css now exists."
  echo "Then, try running 'npm run dev' again."
else
  echo "Error reinstalling react-quill. Please check the output above."
  exit 1
fi

exit 0

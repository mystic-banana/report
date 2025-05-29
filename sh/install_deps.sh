#!/bin/zsh # Changed from /bin/bash to /bin/zsh
# Script to install project dependencies

echo "Initializing NVM and setting Node.js version..."

# Source NVM
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"  # This loads nvm
  
  # Attempt to use LTS version. If not installed, try to install it.
  if ! nvm use --lts --silent; then
    echo "NVM LTS version not found or not set, attempting to install and use..."
    nvm install --lts
    nvm use --lts
  fi
  
  # Verify npm is available now
  if ! command -v npm &> /dev/null; then
    echo "Error: npm command still not found after attempting to load NVM and set Node version."
    echo "Please check your NVM installation and ~/.zshrc configuration."
    exit 1
  else
    echo "NVM initialized. Node version: $(node -v), npm version: $(npm -v)"
  fi
else
  echo "Error: NVM script not found at $NVM_DIR/nvm.sh."
  echo "Please ensure NVM is correctly installed and configured in ~/.zshrc."
  exit 1
fi

echo "Installing project dependencies using npm..."

# Navigate to the project root directory if the script is not already there
# This assumes the script is run from the 'sh' directory or the project root.
PROJECT_ROOT_FOUND=false
if [ -f "../package.json" ]; then
  cd ..
  PROJECT_ROOT_FOUND=true
elif [ -f "package.json" ]; then
  PROJECT_ROOT_FOUND=true
fi

if [ "$PROJECT_ROOT_FOUND" = false ]; then
  echo "Error: package.json not found. Make sure you are in the project root or 'sh' directory."
  exit 1
fi

npm install

if [ $? -eq 0 ]; then
  echo "Dependencies installed successfully."
else
  echo "Error installing dependencies. See the output above for details."
  exit 1
fi

exit 0

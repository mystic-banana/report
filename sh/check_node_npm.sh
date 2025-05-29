#!/bin/bash

echo "Diagnosing 'npm: command not found' error..."
echo "---------------------------------------------"

# Check for nvm
echo "1. Checking for Node Version Manager (nvm)..."
if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "   nvm appears to be installed at $NVM_DIR."
  echo "   Attempting to source nvm to make it available in this script session..."
  source "$NVM_DIR/nvm.sh" # Source nvm
  if command -v nvm &> /dev/null; then
    echo "   nvm command is now available."
    
    echo "   Checking current Node.js version using nvm..."
    CURRENT_NODE_VERSION=$(nvm current 2>/dev/null)
    if [ -z "$CURRENT_NODE_VERSION" ] || [ "$CURRENT_NODE_VERSION" == "none" ] || [ "$CURRENT_NODE_VERSION" == "system" ]; then
      echo "   No active Node.js version managed by nvm, or system Node is active (which might not include npm correctly in PATH for scripts)."
      echo "   You can try installing and using the latest LTS Node.js version via nvm:"
      echo "     nvm install --lts"
      echo "     nvm use --lts"
      echo "   Then, verify with 'node -v' and 'npm -v' in a new terminal."
    else
      echo "   Active nvm Node.js version: $CURRENT_NODE_VERSION"
      echo "   Checking if npm is available with this version..."
      if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        echo "   npm is available. Version: $NPM_VERSION"
        echo "   The 'npm: command not found' error might be due to PATH issues specific to how the previous script was run."
        echo "   Ensure nvm is sourced in your shell profile (e.g., ~/.zshrc, ~/.bashrc, ~/.profile) and you are in a shell where nvm is active."
      else
        echo "   npm command is still not found even with nvm and an active Node version ($CURRENT_NODE_VERSION)."
        echo "   This is unusual. Your nvm installation or the Node version might be corrupted."
        echo "   Try reinstalling the Node version: nvm uninstall $CURRENT_NODE_VERSION && nvm install $CURRENT_NODE_VERSION && nvm use $CURRENT_NODE_VERSION"
      fi
    fi
  else
    echo "   Sourcing nvm.sh did not make the nvm command available. Ensure nvm is correctly installed and configured."
    echo "   You might need to close this terminal and open a new one after installing nvm."
  fi
elif command -v node &> /dev/null && command -v npm &> /dev/null; then
  echo "   nvm not found, but 'node' and 'npm' commands are globally available."
  NODE_VERSION=$(node -v)
  NPM_VERSION=$(npm -v)
  echo "   Node version: $NODE_VERSION"
  echo "   npm version: $NPM_VERSION"
  echo "   The 'npm: command not found' error in the script might be due to PATH issues in the script's execution environment."
  echo "   Ensure Node.js and npm binaries are in your system's PATH accessible by scripts."
else
  echo "   nvm is not found."
  echo "   Node.js and npm also do not seem to be installed or in the PATH."
  echo ""
  echo "2. Recommendation:"
  echo "   Install Node.js and npm. The recommended way is using nvm (Node Version Manager)."
  echo "   To install nvm, you can typically run a command like this in your terminal (check the official nvm GitHub repository for the latest version and command):"
  echo "     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo "   Or if you prefer Wget:"
  echo "     wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo "   After installing nvm, YOU MUST CLOSE AND REOPEN YOUR TERMINAL, or source your shell profile (e.g., 'source ~/.zshrc' or 'source ~/.bashrc')."
  echo "   Then, install a Node.js version (e.g., latest LTS):"
  echo "     nvm install --lts"
  echo "     nvm use --lts"
  echo "   Verify installation in the new terminal session:"
  echo "     node -v"
  echo "     npm -v"
fi

echo ""
echo "---------------------------------------------"
echo "After ensuring Node.js and npm are correctly installed and accessible in your PATH (and nvm is active if you used it),"
echo "please try running the dependency installation script again from your project's 'sh' directory or root:"
echo "  /Users/startupomatic/Documents/work/mysticbanana/sh/install_deps.sh"
  echo "or from project root:"
  echo "  sh sh/install_deps.sh"
echo ""
echo "If you used nvm, ensure it's loaded in your current shell session before running the script."
echo "For example, run 'nvm use --lts' (or your desired version) in your terminal first."

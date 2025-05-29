#!/bin/bash

echo "Configuring ~/.zshrc for NVM..."
echo "----------------------------------------------------------------------"

# Define the NVM configuration lines
NVM_CONFIG_LINES='
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
'

# Path to the .zshrc file
ZSHRC_FILE="$HOME/.zshrc"

# Append the configuration lines to .zshrc
# Check if the lines are already there to avoid duplication (simple check)
if grep -q "NVM_DIR" "$ZSHRC_FILE" && grep -q "nvm.sh" "$ZSHRC_FILE"; then
  echo "NVM configuration lines already seem to exist in $ZSHRC_FILE."
  echo "No changes made to prevent duplication. Please verify manually if needed."
else
  echo "Appending NVM configuration to $ZSHRC_FILE..."
  echo "$NVM_CONFIG_LINES" >> "$ZSHRC_FILE"
  echo "NVM configuration successfully appended to $ZSHRC_FILE."
fi

echo "----------------------------------------------------------------------"
echo "Configuration of ~/.zshrc is complete."
echo ""
echo "IMPORTANT NEXT STEPS (You MUST do these manually):"
echo "1. Apply the changes to your current shell environment:"
echo "   EITHER: Close this terminal and OPEN A NEW terminal window."
echo "   OR:     Run the command 'source ~/.zshrc' in your current terminal."
echo ""
echo "2. In the NEW (or sourced) terminal, install the latest LTS Node.js:"
echo "   nvm install --lts"
echo ""
echo "3. Tell nvm to use this version:"
echo "   nvm use --lts"
echo ""
echo "4. Verify the installation:"
echo "   node -v"
echo "   npm -v"
echo "   (You should see version numbers for both)"
echo ""
echo "5. Once Node.js and npm are confirmed, navigate back to your project directory:"
echo "   cd /Users/startupomatic/Documents/work/mysticbanana"
echo ""
echo "6. Then, try running the dependency installation script again:"
echo "   sh/install_deps.sh"
echo "----------------------------------------------------------------------"

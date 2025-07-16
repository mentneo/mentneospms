#!/bin/bash

echo "=== Firebase Permission Fix ==="
echo "This script will update Firebase security rules to allow full access in development mode."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not found, installing..."
  npm install -g firebase-tools
fi

# Login to Firebase
echo "Logging into Firebase..."
firebase login

# Create a temporary .firebaserc file if it doesn't exist
if [ ! -f ".firebaserc" ]; then
  echo "Creating .firebaserc file..."
  echo '{
  "projects": {
    "default": "rideshare-6470e"
  }
}' > .firebaserc
fi

# Deploy security rules
echo "Deploying security rules with full access..."
firebase deploy --only firestore:rules

echo ""
echo "Firebase security rules have been updated to allow full access."
echo "IMPORTANT: This is only for development purposes."
echo "For production, update the rules in src/firebase/firestore.rules"
echo "and uncomment the production rules section."
echo ""
echo "If you're still having issues:"
echo "1. Clear your browser cache and reload"
echo "2. Create the missing indexes by visiting the URLs in error messages"
echo "3. Check Firebase console for any other issues"

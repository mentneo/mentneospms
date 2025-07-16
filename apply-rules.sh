#!/bin/bash

echo "=== Applying Firebase Rules ==="
echo "This will set permissions to allow all reads and writes (development mode)"

# Check for firebase CLI
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not found. Installing..."
  npm install -g firebase-tools
fi

# Log in to Firebase
echo "Logging in to Firebase..."
firebase login

# Check if .firebaserc exists
if [ ! -f ".firebaserc" ]; then
  echo "Creating .firebaserc with project ID..."
  echo '{
  "projects": {
    "default": "rideshare-6470e"
  }
}' > .firebaserc
fi

# Deploy rules
echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo ""
echo "Rules successfully deployed!"
echo ""
echo "Important notes:"
echo "1. The rules are now set to allow all access (for development only)"
echo "2. If you're still seeing permission errors, try the following:"
echo "   - Clear your browser cache and reload the page"
echo "   - Sign out and sign back in"
echo "   - Restart the development server"
echo ""
echo "For index errors, visit this URL:"
echo "https://console.firebase.google.com/v1/r/project/rideshare-6470e/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yaWRlc2hhcmUtNjQ3MGUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJzL2luZGV4ZXMvXxABGggKBHJvbGUQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ"

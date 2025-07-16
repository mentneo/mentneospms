#!/bin/bash

echo "Fixing Gateman Firebase permissions..."

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not installed. Installing now..."
  npm install -g firebase-tools
fi

# Login to Firebase
echo "Logging into Firebase..."
firebase login

# Ensure .firebaserc exists
if [ ! -f ".firebaserc" ]; then
  echo "Creating .firebaserc file..."
  echo '{
  "projects": {
    "default": "rideshare-6470e"
  }
}' > .firebaserc
fi

# Deploy the updated rules
echo "Deploying updated security rules..."
firebase deploy --only firestore:rules

echo ""
echo "✅ Security rules have been updated!"
echo "The gateman should now have proper access to leave records."
echo ""
echo "If you're still seeing permission errors:"
echo "1. Clear your browser cache"
echo "2. Sign out and sign back in"
echo "3. Restart your development server"
echo ""
echo "Make the script executable with: chmod +x fix-gateman-permissions.sh"

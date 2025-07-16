#!/bin/bash

echo "=========================================="
echo "Firebase Permission Fix for Gateman Access"
echo "=========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not found. Installing now..."
  npm install -g firebase-tools
fi

# Ensure .firebaserc file exists
if [ ! -f ".firebaserc" ]; then
  echo "Creating .firebaserc file..."
  echo '{
  "projects": {
    "default": "rideshare-6470e"
  }
}' > .firebaserc
fi

# Login to Firebase
echo "Logging in to Firebase..."
firebase login

# Deploy Firestore rules
echo "Deploying updated Firestore security rules..."
firebase deploy --only firestore:rules

echo ""
echo "✅ Firebase security rules updated successfully!"
echo ""
echo "To fix the gateman permission issues:"
echo ""
echo "1. Clear your browser cache"
echo "2. Sign out and sign in again"
echo "3. Refresh the page"
echo ""
echo "The updated rules allow full access during development."
echo "When you're ready for production, edit src/firebase/firestore.rules"
echo "to uncomment the production rules."
echo ""
echo "If you're still seeing permission errors, check the Firebase console"
echo "to make sure your user account has the correct 'gateman' role."

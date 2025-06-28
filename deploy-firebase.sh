#!/bin/bash

# Install Firebase CLI if not already installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
firebase login

# Deploy Firestore rules and indexes
echo "Deploying Firestore rules and indexes..."
firebase deploy --only firestore

echo ""
echo "Deployment complete!"
echo ""
echo "If you're still seeing index errors, visit these specific URLs to create them:"
echo "https://console.firebase.google.com/v1/r/project/rideshare-6470e/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yaWRlc2hhcmUtNjQ3MGUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJzL2luZGV4ZXMvXxABGggKBHJvbGUQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ"
echo ""
echo "Remember to make the script executable with: chmod +x deploy-firebase.sh"

#!/bin/bash

echo "Deploying Firestore indexes to Firebase..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not found, installing..."
  npm install -g firebase-tools
fi

# Login to Firebase if needed
firebase login

# Deploy the indexes
echo "Deploying indexes from firestore.indexes.json..."
firebase deploy --only firestore:indexes

echo "Done! Your indexes should be deployed."
echo "If you continue to see index errors, visit the URLs from the error messages."

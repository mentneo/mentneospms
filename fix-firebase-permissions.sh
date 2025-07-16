#!/bin/bash

echo "Fixing Firebase permissions and indexes..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not found, installing..."
  npm install -g firebase-tools
fi

# Login to Firebase
firebase login

# Deploy security rules
echo "Deploying security rules..."
firebase deploy --only firestore:rules

# Deploy indexes
echo "Deploying indexes..."
firebase deploy --only firestore:indexes

echo ""
echo "Firebase permissions and indexes have been updated."
echo "If you still see errors, try the following:"
echo ""
echo "1. Visit the index link in the error message directly:"
echo "https://console.firebase.google.com/v1/r/project/rideshare-6470e/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9yaWRlc2hhcmUtNjQ3MGUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xlYXZlcy9pbmRleGVzL18QARoRCg1nYXRlbWFuU3RhdHVzEAEaCgoGc3RhdHVzEAEaDAoIZnJvbURhdGUQARoMCghfX25hbWVfXxAB"
echo ""
echo "2. Restart your application"
echo ""
echo "3. If errors persist, modify your code to use simpler queries"

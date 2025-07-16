#!/bin/bash

echo "========================================="
echo "Resetting Firebase to Fix Internal Errors"
echo "========================================="
echo ""

# Stop the development server if running
echo "Stopping any running development server..."
pkill -f "react-scripts start" || true

# Clear browser's IndexedDB data
echo "Please clear your browser cache and IndexedDB storage:"
echo "1. Open your browser's developer tools (F12 or Cmd+Option+I)"
echo "2. Go to Application tab"
echo "3. Under Storage, select 'IndexedDB'"
echo "4. Right-click on 'firestore' and select 'Delete Database'"
echo "5. Clear site data and cookies for localhost"
echo ""
echo "Press Enter when you've completed these steps..."
read -p ""

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Reminder about Firebase rules
echo ""
echo "Ensure your Firebase rules are deployed:"
echo "firebase deploy --only firestore:rules"
echo ""

echo "Reset complete. Now start your development server with:"
echo "npm start"
echo ""
echo "If you continue to see internal assertion errors:"
echo "1. Check Firebase console for any backend issues"
echo "2. Try using a different browser"
echo "3. Consider downgrading Firebase to version 9.17.0:"
echo "   npm install firebase@9.17.0"

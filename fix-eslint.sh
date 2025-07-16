#!/bin/bash

echo "Fixing ESLint configuration issues..."

# Remove node_modules and package-lock.json
echo "Cleaning up node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Install specific version of eslint-plugin-flowtype that works with react-scripts
echo "Installing compatible eslint-plugin-flowtype..."
npm install --save-dev eslint-plugin-flowtype@8.0.3

# Install other necessary ESLint plugins
echo "Installing other ESLint dependencies..."
npm install --save-dev eslint@8.40.0 eslint-plugin-react@7.32.2 

# Reinstall all dependencies
echo "Reinstalling all dependencies..."
npm install

echo "Done! Try running the app with: npm start"

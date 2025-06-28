# Student Permission Management System

## Firebase Setup

### Fix Permission Denied and Index Errors

The application is currently showing Firebase permission errors and missing index errors. Follow these steps to fix them:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Create Required Indexes**:
   Visit the following URL in your browser to create the required index:
   https://console.firebase.google.com/v1/r/project/rideshare-6470e/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yaWRlc2hhcmUtNjQ3MGUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJzL2luZGV4ZXMvXxABGggKBHJvbGUQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ

   Or deploy all indexes at once:
   ```bash
   firebase deploy --only firestore:indexes
   ```

After completing these steps, restart your application.

## Fixing Firebase Index Errors

If you're seeing errors like `The query requires an index`, you need to create the required Firebase indexes:

### Option 1: Using the Firebase Console
1. Click on the error links in the console which will take you directly to the Firebase console to create the specific index needed
2. Example: https://console.firebase.google.com/v1/r/project/rideshare-6470e/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yaWRlc2hhcmUtNjQ3MGUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJzL2luZGV4ZXMvXxABGggKBHJvbGUQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ

### Option 2: Using Firebase CLI
1. Make sure you have Firebase CLI installed:
   ```
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```
   firebase login
   ```
3. Deploy the indexes:
   ```
   firebase deploy --only firestore:indexes
   ```

### Option 3: Using the provided script
1. Make the script executable:
   ```
   chmod +x deploy-firebase.sh
   ```
2. Run the script:
   ```
   ./deploy-firebase.sh
   ```

## Usage
...

import { getFirestore } from "firebase/firestore";
import app from "./config";

const db = getFirestore(app);

// Fix the missing indexes by logging instructions
console.log(`
To fix the Firebase permission and index errors:

1. Install Firebase CLI if not already installed:
   npm install -g firebase-tools

2. Login to Firebase:
   firebase login

3. Initialize Firebase in your project:
   firebase init

4. Select Firestore and follow the prompts

5. When complete, deploy the security rules:
   firebase deploy --only firestore:rules

6. Create required indexes by visiting these URLs:
   https://console.firebase.google.com/v1/r/project/rideshare-6470e/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yaWRlc2hhcmUtNjQ3MGUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJzL2luZGV4ZXMvXxABGggKBHJvbGUQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ

   When you visit these links in your browser, Firebase will automatically set up the indexes for you.
`);

export default db;

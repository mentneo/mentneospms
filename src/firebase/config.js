import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyConOLAgEeOZWp9a2z8ZI49IYqG-f8bSeU",
  authDomain: "rideshare-6470e.firebaseapp.com",
  projectId: "rideshare-6470e",
  storageBucket: "rideshare-6470e.firebasestorage.app",
  messagingSenderId: "665039371677",
  appId: "1:665039371677:web:09ba2a5402081e26c30374",
  measurementId: "G-B5T87F2DXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Enable offline persistence (improves performance and reduces errors)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('The current browser does not support all of the features required to enable persistence.');
    }
  });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

// Create simpler query functions that avoid complex indexes
export const simpleQuery = (collectionRef, field, value) => {
  // Use this function instead of complex queries that require indexes
  return collectionRef.where(field, '==', value);
};

// Handle Firebase errors gracefully
export const handleFirebaseError = (error) => {
  console.error("Firebase error:", error);
  
  if (error.code === 'permission-denied') {
    console.log("Permission denied. Make sure you have deployed security rules.");
    return "You don't have permission to access this data. Please contact the administrator.";
  }
  
  if (error.code === 'failed-precondition' && error.message.includes('index')) {
    console.log("Index required. Visit the URL in the error message to create it.");
    return "Database index not set up. Please contact the administrator to set up required indexes.";
  }
  
  return error.message || "An error occurred";
};

export default app;

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
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

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure Firestore for better live dashboard performance
const firestoreSettings = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true
};

// Enable offline persistence more safely
try {
  if (typeof window !== 'undefined') {
    // Only enable persistence in browser environments
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        // Continue with normal operation, just without persistence
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence.');
        // Continue with normal operation, just without persistence
      }
    });
  }
} catch (error) {
  console.warn("Could not enable persistence. Continuing with normal operation:", error);
  // This won't affect real-time updates, just offline capability
}

// Helper function for real-time listener setup with error handling
export const createRealtimeListener = (query, callback, errorCallback) => {
  try {
    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        callback(items);
      },
      (error) => {
        console.error("Realtime listener error:", error);
        if (errorCallback) errorCallback(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("Failed to create realtime listener:", error);
    if (errorCallback) errorCallback(error);
    return () => {}; // Return no-op function as fallback
  }
};

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

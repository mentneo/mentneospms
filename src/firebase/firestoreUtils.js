import { getDocs, query, where, collection, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { toast } from 'react-toastify';

/**
 * Utility function to safely perform queries that might need indexes
 * Falls back to client-side filtering if index errors occur
 */
export const safeQuery = async (collectionName, constraints, fallbackField = null, fallbackValue = null) => {
  try {
    // Try with the full query first
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    // If it's an index error, fall back to a simpler query + client filtering
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.warn("Index error, falling back to client filtering", error.message);
      
      // Get the collection with minimal filtering
      let q;
      if (fallbackField && fallbackValue !== null) {
        // Use a simple where clause that doesn't need composite indexes
        q = query(collection(db, collectionName), where(fallbackField, '==', fallbackValue));
      } else {
        // Just get the whole collection if no fallback specified
        q = collection(db, collectionName);
      }
      
      const snapshot = await getDocs(q);
      const allDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Show a toast notification about the index
      toast.info(
        "Some database indexes haven't been created yet. Performance might be affected. " +
        "Visit the Firebase console to create them.", 
        { autoClose: 10000 }
      );
      
      return allDocs;
    }
    
    // For other errors, just throw
    throw error;
  }
};

/**
 * Create a safe real-time listener that handles index errors
 */
export const safeListener = (collectionName, constraints, callback, fallbackField = null, fallbackValue = null) => {
  try {
    // Try with the full query first
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      // If it's an index error, fall back to a simpler query + client filtering
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn("Index error in listener, falling back to client filtering", error.message);
        
        // Get the collection with minimal filtering
        let q;
        if (fallbackField && fallbackValue !== null) {
          // Use a simple where clause that doesn't need composite indexes
          q = query(collection(db, collectionName), where(fallbackField, '==', fallbackValue));
        } else {
          // Just get the whole collection if no fallback specified
          q = collection(db, collectionName);
        }
        
        // Set up a new listener with the simpler query
        return onSnapshot(q, (snapshot) => {
          const allDocs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Show a toast notification about the index
          toast.info(
            "Some database indexes haven't been created yet. Performance might be affected. " +
            "Visit the Firebase console to create them.", 
            { autoClose: 10000 }
          );
          
          callback(allDocs);
        });
      }
      
      // For other errors, just throw
      console.error("Listener error:", error);
      toast.error("Error listening for updates: " + error.message);
    });
  } catch (error) {
    console.error("Error setting up listener:", error);
    toast.error("Error setting up updates: " + error.message);
    return () => {}; // Return empty function as unsubscribe
  }
};

/**
 * Instructions to display for fixing index errors
 */
export const getIndexInstructions = () => {
  return `
To fix the "query requires an index" errors:

1. Visit the Firebase console: https://console.firebase.google.com/
2. Select your project: rideshare-6470e
3. Go to Firestore Database
4. Click on "Indexes" tab
5. Create the required indexes or click on the links in the error messages
6. Or deploy all indexes at once with Firebase CLI:
   firebase deploy --only firestore:indexes

You can also use the safeQuery and safeListener functions from firestoreUtils.js
to handle index errors gracefully.
  `;
};

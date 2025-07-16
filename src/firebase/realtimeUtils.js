import { collection, query, where, onSnapshot, orderBy, limit, doc } from 'firebase/firestore';
import { db } from './config';

/**
 * Create a real-time listener for a dashboard component
 * @param {string} collectionName - Firestore collection name
 * @param {Array} constraints - Query constraints like where, orderBy
 * @param {Function} onData - Callback when data updates
 * @param {Function} onError - Error callback
 * @returns {Function} Unsubscribe function
 */
export const createDashboardListener = (collectionName, constraints, onData, onError) => {
  try {
    // Create collection reference
    const collectionRef = collection(db, collectionName);
    
    // Create query with constraints
    const q = query(collectionRef, ...constraints);
    
    // Set up realtime listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Map documents to data objects
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Call the callback with data
        onData(data);
      },
      (error) => {
        console.error(`Error in ${collectionName} listener:`, error);
        
        // Handle specific errors
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.warn('Missing index. Falling back to simplified query...');
          
          // Try simplified query without orderBy
          const fallbackConstraints = constraints.filter(
            c => c.type !== 'orderBy'
          );
          
          // If we have at least one constraint left, create fallback query
          if (fallbackConstraints.length > 0) {
            const fallbackQuery = query(collectionRef, ...fallbackConstraints);
            
            // Set up new listener with simplified query
            return onSnapshot(
              fallbackQuery, 
              (fallbackSnapshot) => {
                const fallbackData = fallbackSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                
                // Sort manually in memory instead of using orderBy
                fallbackData.sort((a, b) => {
                  // Determine sort field from original constraints
                  const orderByConstraint = constraints.find(c => c.type === 'orderBy');
                  const sortField = orderByConstraint ? orderByConstraint.field : 'createdAt';
                  const direction = orderByConstraint && orderByConstraint.direction === 'desc' ? -1 : 1;
                  
                  // Handle dates
                  const aValue = a[sortField]?.toDate ? a[sortField].toDate() : a[sortField];
                  const bValue = b[sortField]?.toDate ? b[sortField].toDate() : b[sortField];
                  
                  if (aValue < bValue) return -1 * direction;
                  if (aValue > bValue) return 1 * direction;
                  return 0;
                });
                
                onData(fallbackData);
              },
              onError
            );
          }
        }
        
        // Call error handler
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error(`Failed to set up ${collectionName} listener:`, error);
    if (onError) onError(error);
    return () => {}; // Return empty function as unsubscribe
  }
};

/**
 * Create a simplified real-time listener for a single entity
 * @param {string} collectionName - Collection name
 * @param {string} id - Document ID
 * @param {Function} onData - Data callback
 * @param {Function} onError - Error callback
 * @returns {Function} Unsubscribe function
 */
export const createEntityListener = (collectionName, id, onData, onError) => {
  try {
    const docRef = doc(db, collectionName, id);
    
    return onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          onData({
            id: docSnapshot.id,
            ...docSnapshot.data()
          });
        } else {
          onData(null);
        }
      },
      (error) => {
        console.error(`Error in ${collectionName}/${id} listener:`, error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error(`Failed to set up ${collectionName}/${id} listener:`, error);
    if (onError) onError(error);
    return () => {};
  }
};

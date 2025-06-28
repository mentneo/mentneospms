import React from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
import { handleFirebaseError } from '../../firebase/config';

export default function ErrorHandler({ error, resetError }) {
  const errorMessage = handleFirebaseError(error);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Alert 
        severity="error" 
        action={
          resetError ? (
            <Button color="inherit" size="small" onClick={resetError}>
              Try Again
            </Button>
          ) : null
        }
      >
        <Typography variant="body2">{errorMessage}</Typography>
        
        {error?.code === 'permission-denied' && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            This is likely due to Firebase security rules. Make sure you've deployed the correct rules.
          </Typography>
        )}
        
        {error?.code === 'failed-precondition' && error?.message.includes('index') && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            This query requires a composite index. Check the console for the link to create it.
          </Typography>
        )}
      </Alert>
    </Box>
  );
}

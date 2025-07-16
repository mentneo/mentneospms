import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';

export default function ViewLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simple query to avoid index requirements
        const leavesRef = collection(db, 'leaves');
        let leavesQuery;
        
        // Try to use real-time listener first
        try {
          leavesQuery = query(leavesRef, orderBy('createdAt', 'desc'));
          
          const unsubscribe = onSnapshot(leavesQuery, (snapshot) => {
            const leavesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setLeaves(leavesData);
            setLoading(false);
          }, (error) => {
            console.error("Real-time listener error:", error);
            // Fall back to one-time query without orderBy
            fetchWithoutOrdering();
          });
          
          return () => unsubscribe();
        } catch (error) {
          console.error("Failed to set up real-time listener:", error);
          fetchWithoutOrdering();
        }
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setError(error.message || 'Failed to load leave requests');
        setLoading(false);
      }
    };
    
    const fetchWithoutOrdering = async () => {
      try {
        // Fallback to simple query without orderBy
        const leavesRef = collection(db, 'leaves');
        const snapshot = await getDocs(leavesRef);
        
        const leavesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort client-side
        leavesData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA; // descending order
        });
        
        setLeaves(leavesData);
        setLoading(false);
      } catch (error) {
        console.error('Error in fallback query:', error);
        setError(error.message || 'Failed to load leave requests');
        setLoading(false);
      }
    };
    
    fetchLeaves();
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const filteredLeaves = (() => {
    switch (currentTab) {
      case 'pending':
        return leaves.filter(leave => leave.status === 'pending');
      case 'approved':
        return leaves.filter(leave => leave.status === 'approved');
      case 'rejected':
        return leaves.filter(leave => leave.status === 'rejected');
      case 'completed':
        return leaves.filter(leave => leave.status === 'completed');
      default:
        return leaves;
    }
  })();

  // Function to render status badge with appropriate color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" />;
      case 'approved':
        return <Chip label="Approved" color="success" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" />;
      case 'completed':
        return <Chip label="Completed" color="info" />;
      default:
        return <Chip label={status} />;
    }
  };
  
  // Function to render gateman status badge
  const getGatemanStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return <Chip label="Waiting" variant="outlined" />;
      case 'out':
        return <Chip label="Exited" color="primary" variant="outlined" />;
      case 'returned':
        return <Chip label="Returned" color="success" variant="outlined" />;
      default:
        return <Chip label={status || "N/A"} variant="outlined" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Typography sx={{ mt: 2 }}>
          This might be due to permission or index issues. Please make sure you have proper Firebase access.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        All Leave Requests
      </Typography>
      
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab value="all" label="All Leaves" />
        <Tab value="pending" label="Pending" />
        <Tab value="approved" label="Approved" />
        <Tab value="rejected" label="Rejected" />
        <Tab value="completed" label="Completed" />
      </Tabs>
      
      {filteredLeaves.length === 0 ? (
        <Typography>No leave requests found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Gateman Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.studentName || "Unknown"}</TableCell>
                  <TableCell>{leave.teacherName || 'Not Assigned'}</TableCell>
                  <TableCell>
                    {leave.type === 'home' ? 'Home Leave' : leave.type === 'sick' ? 'Sick Leave' : 'Other'}
                  </TableCell>
                  <TableCell>{leave.fromDate ? new Date(leave.fromDate).toLocaleString() : "N/A"}</TableCell>
                  <TableCell>{leave.toDate ? new Date(leave.toDate).toLocaleString() : "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell>{getGatemanStatusBadge(leave.gatemanStatus)}</TableCell>
                  <TableCell>{leave.teacherRemarks || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

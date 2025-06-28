import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
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
  Chip
} from '@mui/material';

export default function ViewLeaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = () => {
      const leavesRef = collection(db, 'leaves');
      const q = query(
        leavesRef,
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leavesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeaves(leavesData);
        setLoading(false);
      });
      
      return unsubscribe;
    };
    
    const unsubscribe = fetchLeaves();
    return () => unsubscribe();
  }, [currentUser]);

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
        return <Chip label={status} variant="outlined" />;
    }
  };

  if (loading) {
    return <Typography>Loading leave requests...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Leave Requests
      </Typography>
      
      {leaves.length === 0 ? (
        <Typography>You haven't submitted any leave requests yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Gateman Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    {leave.type === 'home' ? 'Home Leave' : leave.type === 'sick' ? 'Sick Leave' : 'Other'}
                  </TableCell>
                  <TableCell>{new Date(leave.fromDate).toLocaleString()}</TableCell>
                  <TableCell>{new Date(leave.toDate).toLocaleString()}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
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

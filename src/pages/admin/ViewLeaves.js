import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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
  Tab
} from '@mui/material';

export default function ViewLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');

  useEffect(() => {
    const fetchLeaves = () => {
      const leavesRef = collection(db, 'leaves');
      const q = query(leavesRef, orderBy('createdAt', 'desc'));
      
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
        return <Chip label={status} variant="outlined" />;
    }
  };

  if (loading) {
    return <Typography>Loading leave requests...</Typography>;
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
                  <TableCell>{leave.studentName}</TableCell>
                  <TableCell>{leave.teacherName || 'Not Assigned'}</TableCell>
                  <TableCell>
                    {leave.type === 'home' ? 'Home Leave' : leave.type === 'sick' ? 'Sick Leave' : 'Other'}
                  </TableCell>
                  <TableCell>{new Date(leave.fromDate).toLocaleString()}</TableCell>
                  <TableCell>{new Date(leave.toDate).toLocaleString()}</TableCell>
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

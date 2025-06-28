import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';

export default function LeaveHistory() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Base query - get all leaves for teacher
        let leavesQuery = query(
          collection(db, 'leaves'),
          where('teacherId', '==', currentUser.uid)
        );
        
        // If filtering by status (not 'all')
        if (statusFilter !== 'all') {
          leavesQuery = query(
            collection(db, 'leaves'),
            where('teacherId', '==', currentUser.uid),
            where('status', '==', statusFilter)
          );
        }
        
        const querySnapshot = await getDocs(leavesQuery);
        const leavesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by creation date (newest first) client-side
        // to avoid index requirements
        leavesData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setLeaves(leavesData);
      } catch (error) {
        console.error('Error fetching leave history:', error);
        setError(error.message || 'Failed to load leave history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveHistory();
  }, [currentUser, statusFilter]);

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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Leave History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Leaves</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <CircularProgress />
      ) : leaves.length === 0 ? (
        <Typography>No leave history found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Gateman Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.studentName}</TableCell>
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

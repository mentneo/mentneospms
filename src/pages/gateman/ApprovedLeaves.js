import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
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
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

export default function ApprovedLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    const fetchLeaves = () => {
      const leavesRef = collection(db, 'leaves');
      const q = query(
        leavesRef,
        where('status', '==', 'approved'),
        where('gatemanStatus', 'in', ['waiting', 'out']),
        orderBy('fromDate')
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
  }, []);

  const handleActionClick = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedLeave(null);
  };

  const handleLeaveAction = async () => {
    if (!selectedLeave) return;
    
    try {
      const leaveRef = doc(db, 'leaves', selectedLeave.id);
      
      if (actionType === 'out') {
        await updateDoc(leaveRef, {
          gatemanStatus: 'out',
          exitTime: new Date().toISOString()
        });
        toast.success(`Student ${selectedLeave.studentName} marked as exited!`);
      } else if (actionType === 'returned') {
        await updateDoc(leaveRef, {
          gatemanStatus: 'returned',
          returnTime: new Date().toISOString(),
          status: 'completed'
        });
        toast.success(`Student ${selectedLeave.studentName} marked as returned!`);
      }
      
      handleDialogClose();
      
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <Typography>Loading approved leaves...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Approved Leave Requests
      </Typography>
      
      {leaves.length === 0 ? (
        <Typography>No approved leave requests.</Typography>
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
                <TableCell>Actions</TableCell>
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
                  <TableCell>
                    {leave.gatemanStatus === 'waiting' ? (
                      <Chip label="Waiting to exit" color="warning" />
                    ) : (
                      <Chip label="Out - Waiting return" color="primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    {leave.gatemanStatus === 'waiting' ? (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => handleActionClick(leave, 'out')}
                      >
                        Mark as Exited
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="small"
                        onClick={() => handleActionClick(leave, 'returned')}
                      >
                        Mark as Returned
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'out' 
              ? `Are you sure you want to mark ${selectedLeave?.studentName} as exited?` 
              : `Are you sure you want to mark ${selectedLeave?.studentName} as returned?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleLeaveAction} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

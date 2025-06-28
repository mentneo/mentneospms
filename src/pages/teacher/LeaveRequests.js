import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';

export default function LeaveRequests() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    const fetchLeaves = () => {
      const leavesRef = collection(db, 'leaves');
      const q = query(
        leavesRef,
        where('teacherId', '==', currentUser.uid),
        where('status', '==', 'pending'),
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

  const handleActionClick = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedLeave(null);
    setRemarks('');
  };

  const handleLeaveAction = async () => {
    if (!selectedLeave) return;
    
    try {
      const leaveRef = doc(db, 'leaves', selectedLeave.id);
      await updateDoc(leaveRef, {
        status: actionType,
        teacherRemarks: remarks
      });
      
      toast.success(`Leave request ${actionType === 'approved' ? 'approved' : 'rejected'} successfully!`);
      handleDialogClose();
      
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error('Failed to update leave status');
    }
  };

  if (loading) {
    return <Typography>Loading leave requests...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Pending Leave Requests
      </Typography>
      
      {leaves.length === 0 ? (
        <Typography>No pending leave requests.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Reason</TableCell>
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
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      sx={{ mr: 1 }}
                      onClick={() => handleActionClick(leave, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      onClick={() => handleActionClick(leave, 'rejected')}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {actionType === 'approved' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks (Optional)"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleLeaveAction}
            color={actionType === 'approved' ? 'success' : 'error'}
          >
            {actionType === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

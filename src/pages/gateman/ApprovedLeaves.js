import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

export default function ApprovedLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchApprovedLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all leaves
        const leavesRef = collection(db, 'leaves');
        const snapshot = await getDocs(leavesRef);
        
        const allLeaves = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter for approved leaves client-side
        const approvedLeaves = allLeaves.filter(
          leave => leave.status === 'approved'
        );
        
        setLeaves(approvedLeaves);
      } catch (error) {
        console.error('Error fetching approved leaves:', error);
        setError('Failed to load approved leaves. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovedLeaves();
  }, []);

  const handleExitClick = (leave) => {
    setSelectedLeave(leave);
    setExitDialogOpen(true);
  };

  const handleReturnClick = (leave) => {
    setSelectedLeave(leave);
    setReturnDialogOpen(true);
  };

  const handleExitConfirm = async () => {
    if (!selectedLeave) return;
    
    try {
      const leaveRef = doc(db, 'leaves', selectedLeave.id);
      
      await updateDoc(leaveRef, {
        gatemanStatus: 'out',
        exitTime: new Date().toISOString(),
        gateRemarks: remarks
      });
      
      // Update local state
      setLeaves(leaves.map(leave => 
        leave.id === selectedLeave.id 
          ? { 
              ...leave, 
              gatemanStatus: 'out', 
              exitTime: new Date().toISOString(), 
              gateRemarks: remarks
            } 
          : leave
      ));
      
      toast.success('Student exit recorded successfully');
      setRemarks('');
      setExitDialogOpen(false);
    } catch (error) {
      console.error('Error recording exit:', error);
      toast.error('Failed to record exit: ' + error.message);
    }
  };

  const handleReturnConfirm = async () => {
    if (!selectedLeave) return;
    
    try {
      const leaveRef = doc(db, 'leaves', selectedLeave.id);
      
      await updateDoc(leaveRef, {
        gatemanStatus: 'returned',
        returnTime: new Date().toISOString(),
        gateRemarks: remarks || selectedLeave.gateRemarks
      });
      
      // Update local state
      setLeaves(leaves.map(leave => 
        leave.id === selectedLeave.id 
          ? { 
              ...leave, 
              gatemanStatus: 'returned', 
              returnTime: new Date().toISOString(),
              gateRemarks: remarks || leave.gateRemarks
            } 
          : leave
      ));
      
      toast.success('Student return recorded successfully');
      setRemarks('');
      setReturnDialogOpen(false);
    } catch (error) {
      console.error('Error recording return:', error);
      toast.error('Failed to record return: ' + error.message);
    }
  };

  const handleDialogClose = () => {
    setExitDialogOpen(false);
    setReturnDialogOpen(false);
    setSelectedLeave(null);
    setRemarks('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Approved Leaves
      </Typography>
      
      {leaves.length === 0 ? (
        <Typography>No approved leaves found.</Typography>
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
                    {leave.gatemanStatus === 'waiting' ? 'Waiting to Exit' : 
                     leave.gatemanStatus === 'out' ? 'Out' : 'Returned'}
                  </TableCell>
                  <TableCell>
                    {leave.gatemanStatus === 'waiting' && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => handleExitClick(leave)}
                      >
                        Record Exit
                      </Button>
                    )}
                    {leave.gatemanStatus === 'out' && (
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        size="small"
                        onClick={() => handleReturnClick(leave)}
                      >
                        Record Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Exit Dialog */}
      <Dialog open={exitDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Record Student Exit</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Record that {selectedLeave?.studentName} is exiting the campus.
          </Typography>
          <TextField
            margin="dense"
            label="Remarks (optional)"
            fullWidth
            multiline
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleExitConfirm} color="primary" variant="contained">
            Confirm Exit
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Record Student Return</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Record that {selectedLeave?.studentName} has returned to campus.
          </Typography>
          <TextField
            margin="dense"
            label="Remarks (optional)"
            fullWidth
            multiline
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleReturnConfirm} color="secondary" variant="contained">
            Confirm Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


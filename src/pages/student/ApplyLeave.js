import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid
} from '@mui/material';

export default function ApplyLeave() {
  const { currentUser } = useAuth();
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaveType || !reason || !fromDate || !toDate) {
      return toast.error('Please fill all fields');
    }
    
    try {
      setLoading(true);
      
      await addDoc(collection(db, 'leaves'), {
        studentId: currentUser.uid,
        studentName: currentUser.name,
        teacherId: currentUser.assignedTeacher?.id || null,
        teacherName: currentUser.assignedTeacher?.name || null,
        type: leaveType,
        reason,
        fromDate,
        toDate,
        status: 'pending',
        createdAt: serverTimestamp(),
        gatemanStatus: 'waiting'
      });
      
      toast.success('Leave application submitted successfully!');
      
      // Reset form
      setLeaveType('');
      setReason('');
      setFromDate('');
      setToDate('');
      
    } catch (error) {
      console.error('Error applying for leave:', error);
      toast.error('Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Apply for Leave
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={leaveType}
                label="Leave Type"
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <MenuItem value="home">Home Leave</MenuItem>
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Date"
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="To Date"
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {!currentUser.assignedTeacher && (
        <Box sx={{ mt: 2 }}>
          <Typography color="error">
            Warning: You don't have an assigned teacher. Your leave request may be delayed until a teacher is assigned to you.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

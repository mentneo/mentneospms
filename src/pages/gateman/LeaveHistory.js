import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Base query to get all completed or in-progress leaves
        let leavesQuery = query(
          collection(db, 'leaves'),
          where('gatemanStatus', 'in', ['out', 'returned'])
        );
        
        const querySnapshot = await getDocs(leavesQuery);
        const leavesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by exit time (newest first) client-side
        leavesData.sort((a, b) => {
          const timeA = a.exitTime ? new Date(a.exitTime) : new Date(0);
          const timeB = b.exitTime ? new Date(b.exitTime) : new Date(0);
          return timeB - timeA;
        });
        
        setLeaves(leavesData);
        applyFilters(leavesData, selectedDate, statusFilter);
      } catch (error) {
        console.error('Error fetching leave history:', error);
        setError(error.message || 'Failed to load leave history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaves();
  }, []);

  const applyFilters = (leavesData, date, status) => {
    let filtered = [...leavesData];
    
    // Apply date filter if set
    if (date) {
      const dateString = date.toDateString();
      filtered = filtered.filter(leave => {
        const exitDate = leave.exitTime ? new Date(leave.exitTime).toDateString() : null;
        const returnDate = leave.returnTime ? new Date(leave.returnTime).toDateString() : null;
        return exitDate === dateString || returnDate === dateString;
      });
    }
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      filtered = filtered.filter(leave => leave.gatemanStatus === status);
    }
    
    setFilteredLeaves(filtered);
  };

  useEffect(() => {
    applyFilters(leaves, selectedDate, statusFilter);
  }, [selectedDate, statusFilter, leaves]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Leave Return History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Filter by Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{ textField: { style: { minWidth: '200px' } } }}
          />
        </LocalizationProvider>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="out">Currently Out</MenuItem>
            <MenuItem value="returned">Returned</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {filteredLeaves.length === 0 ? (
        <Typography>No leave history found matching the filters.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Exit Time</TableCell>
                <TableCell>Return Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((leave) => {
                const exitTime = leave.exitTime ? new Date(leave.exitTime) : null;
                const returnTime = leave.returnTime ? new Date(leave.returnTime) : null;
                
                let duration = 'N/A';
                if (exitTime && returnTime) {
                  const durationMs = returnTime - exitTime;
                  const hours = Math.floor(durationMs / (1000 * 60 * 60));
                  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                  duration = `${hours > 0 ? `${hours} hr${hours !== 1 ? 's' : ''}` : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
                }
                
                return (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.studentName}</TableCell>
                    <TableCell>
                      {leave.type === 'home' ? 'Home Leave' : leave.type === 'sick' ? 'Sick Leave' : 'Other'}
                    </TableCell>
                    <TableCell>{exitTime ? exitTime.toLocaleString() : 'Not recorded'}</TableCell>
                    <TableCell>{returnTime ? returnTime.toLocaleString() : 'Not returned'}</TableCell>
                    <TableCell>{duration}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.gatemanStatus === 'out' ? 'Out' : 'Returned'} 
                        color={leave.gatemanStatus === 'out' ? 'primary' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

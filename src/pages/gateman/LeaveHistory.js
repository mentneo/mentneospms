import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Sample fallback data in case Firebase permissions fail
const FALLBACK_DATA = [
  {
    id: 'sample1',
    studentName: 'John Doe',
    type: 'home',
    exitTime: new Date().toISOString(),
    returnTime: new Date(Date.now() + 3600000).toISOString(),
    gatemanStatus: 'returned'
  },
  {
    id: 'sample2',
    studentName: 'Jane Smith',
    type: 'sick',
    exitTime: new Date().toISOString(),
    returnTime: null,
    gatemanStatus: 'out'
  }
];

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [usedFallbackData, setUsedFallbackData] = useState(false);

  useEffect(() => {
    // Super simplified function to fetch data or use fallback
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsedFallbackData(false);
        
        try {
          // Try to get all leaves - no filters
          const leavesRef = collection(db, 'leaves');
          const snapshot = await getDocs(leavesRef);
          
          if (!snapshot.empty) {
            const leavesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Client-side filtering
            const relevantLeaves = leavesData.filter(
              leave => leave.gatemanStatus === 'out' || leave.gatemanStatus === 'returned'
            );
            
            if (relevantLeaves.length > 0) {
              setLeaves(relevantLeaves);
              applyFilters(relevantLeaves, selectedDate, statusFilter);
              setLoading(false);
              return;
            }
          }
          
          // If we got here, we either had permission issues or no data
          throw new Error("No data found or permission denied");
          
        } catch (firebaseError) {
          console.error('Firebase error:', firebaseError);
          throw firebaseError;
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Use fallback data
        console.log("Using fallback data");
        setLeaves(FALLBACK_DATA);
        applyFilters(FALLBACK_DATA, selectedDate, statusFilter);
        setUsedFallbackData(true);
        
        if (error.code === 'permission-denied') {
          setError("Firebase permission denied. Apply security rules or contact administrator.");
        } else {
          setError("Failed to load leave history. Using sample data for demonstration.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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

  // Handle retry button click
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    
    // Delay to give visual feedback
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Leave Return History
      </Typography>
      
      {error && (
        <Alert 
          severity={usedFallbackData ? "warning" : "error"} 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {usedFallbackData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Displaying sample data. To fix permission errors, run the apply-rules.sh script.
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
                    <TableCell>{leave.studentName || 'Unknown'}</TableCell>
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

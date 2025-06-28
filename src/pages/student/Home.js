import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';

export default function StudentHome() {
  const { currentUser } = useAuth();
  const [leaveStats, setLeaveStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDashboard = async () => {
      try {
        // Count leaves by status
        const leavesRef = collection(db, 'leaves');
        
        // Pending leaves
        const pendingQuery = query(
          leavesRef,
          where('studentId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        
        // Approved leaves
        const approvedQuery = query(
          leavesRef,
          where('studentId', '==', currentUser.uid),
          where('status', '==', 'approved')
        );
        const approvedSnapshot = await getDocs(approvedQuery);
        
        // Rejected leaves
        const rejectedQuery = query(
          leavesRef,
          where('studentId', '==', currentUser.uid),
          where('status', '==', 'rejected')
        );
        const rejectedSnapshot = await getDocs(rejectedQuery);
        
        // Fetch recent leaves
        const recentLeavesQuery = query(
          leavesRef,
          where('studentId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentLeavesSnapshot = await getDocs(recentLeavesQuery);
        const recentLeavesData = recentLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLeaveStats({
          pending: pendingSnapshot.size,
          approved: approvedSnapshot.size,
          rejected: rejectedSnapshot.size
        });
        setRecentLeaves(recentLeavesData);
        
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentDashboard();
  }, [currentUser]);

  // Function to render status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Welcome, {currentUser?.name}!
      </Typography>
      
      {!currentUser.assignedTeacher && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You don't have an assigned teacher yet. Please contact administration.
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff8e1', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'warning.main', fontSize: 28 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {leaveStats.pending}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Pending leave requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {leaveStats.approved}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Approved leave requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'error.main', fontSize: 28 }} />
                <Typography variant="h6">Rejected</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {leaveStats.rejected}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Rejected leave requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Teacher
            </Typography>
            {currentUser.assignedTeacher ? (
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6">{currentUser.assignedTeacher.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Assigned Teacher
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Typography color="text.secondary">No teacher assigned yet</Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Leave Requests
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/student/leaves')}
              >
                View All
              </Button>
            </Box>
            
            <List>
              {recentLeaves.length > 0 ? (
                recentLeaves.map((leave, index) => (
                  <React.Fragment key={leave.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>{leave.type === 'home' ? 'Home Leave' : leave.type === 'sick' ? 'Sick Leave' : 'Other'}</Typography>
                            {getStatusBadge(leave.status)}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentLeaves.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No leave requests yet" />
                </ListItem>
              )}
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/student/apply')}
              >
                Apply for New Leave
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

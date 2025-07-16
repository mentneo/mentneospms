import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
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
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import PersonIcon from '@mui/icons-material/Person';

// Fallback data in case Firebase access fails
const FALLBACK_DATA = {
  pendingExits: 3,
  pendingReturns: 2,
  recentActivity: [
    {
      id: 'sample1',
      studentName: 'John Doe',
      exitTime: new Date().toISOString(),
      returnTime: null,
      gatemanStatus: 'out'
    },
    {
      id: 'sample2',
      studentName: 'Jane Smith',
      exitTime: new Date(Date.now() - 3600000).toISOString(),
      returnTime: new Date().toISOString(),
      gatemanStatus: 'returned'
    }
  ]
};

export default function GatemanHome() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    pendingExits: 0,
    pendingReturns: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGatemanDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);
        
        // Simple approach - get all leaves
        const leavesRef = collection(db, 'leaves');
        const snapshot = await getDocs(leavesRef);
        
        const allLeaves = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Client-side filtering
        const pendingExits = allLeaves.filter(
          leave => leave.status === 'approved' && leave.gatemanStatus === 'waiting'
        ).length;
        
        const pendingReturns = allLeaves.filter(
          leave => leave.status === 'approved' && leave.gatemanStatus === 'out'
        ).length;
        
        // Recent activity
        const activity = allLeaves.filter(
          leave => leave.gatemanStatus === 'out' || leave.gatemanStatus === 'returned'
        );
        
        // Sort by exit time
        activity.sort((a, b) => {
          const timeA = a.exitTime ? new Date(a.exitTime) : new Date(0);
          const timeB = b.exitTime ? new Date(b.exitTime) : new Date(0);
          return timeB - timeA;
        });
        
        // Take only the first 5
        const recentActivity = activity.slice(0, 5);
        
        setStats({
          pendingExits,
          pendingReturns
        });
        setRecentActivity(recentActivity);
        
      } catch (error) {
        console.error('Firebase error:', error);
        setError('Failed to load data from Firebase. Using sample data instead.');
        
        // Use fallback data
        setStats({
          pendingExits: FALLBACK_DATA.pendingExits,
          pendingReturns: FALLBACK_DATA.pendingReturns
        });
        setRecentActivity(FALLBACK_DATA.recentActivity);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGatemanDashboard();
  }, []);

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
        Welcome, {currentUser?.name}!
      </Typography>
      
      {error && (
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      
      {usingFallback && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Using sample data for demonstration. To fix Firebase permissions:
          <ol>
            <li>Run the deployment script to update security rules</li>
            <li>Clear your browser cache and reload</li>
            <li>Sign out and sign back in to refresh your authentication</li>
          </ol>
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: stats.pendingExits > 0 ? '#e3f2fd' : '#f5f5f5', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExitToAppIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6">Pending Exits</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.pendingExits}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Students waiting to exit
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/gateman/approved')}
              >
                View Approved Leaves
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: stats.pendingReturns > 0 ? '#fff8e1' : '#f5f5f5', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentReturnedIcon sx={{ mr: 1, color: 'warning.main', fontSize: 28 }} />
                <Typography variant="h6">Pending Returns</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.pendingReturns}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Students currently out on leave
              </Typography>
              <Button 
                variant="outlined" 
                color="warning"
                onClick={() => navigate('/gateman/approved')}
              >
                Check Returns
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {recentActivity.length > 0 ? (
            recentActivity.map((leave, index) => (
              <React.Fragment key={leave.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={leave.studentName || "Student"}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {leave.gatemanStatus === 'out' ? 'Exited at:' : 'Returned at:'}
                        </Typography>
                        {` ${leave.gatemanStatus === 'out' 
                          ? (leave.exitTime ? new Date(leave.exitTime).toLocaleString() : 'Not recorded')
                          : (leave.returnTime ? new Date(leave.returnTime).toLocaleString() : 'Not recorded')}`}
                      </>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No recent activity" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

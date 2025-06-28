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
  ListItemAvatar,
  Avatar
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import PersonIcon from '@mui/icons-material/Person';

export default function GatemanHome() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    pendingExits: 0,
    pendingReturns: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGatemanDashboard = async () => {
      try {
        // Count pending exits (approved leaves waiting for exit)
        const pendingExitsQuery = query(
          collection(db, 'leaves'),
          where('status', '==', 'approved'),
          where('gatemanStatus', '==', 'waiting')
        );
        const pendingExitsSnapshot = await getDocs(pendingExitsQuery);
        
        // Count pending returns (students out but not returned)
        const pendingReturnsQuery = query(
          collection(db, 'leaves'),
          where('status', '==', 'approved'),
          where('gatemanStatus', '==', 'out')
        );
        const pendingReturnsSnapshot = await getDocs(pendingReturnsQuery);
        
        // Fetch recent activity
        const recentActivityQuery = query(
          collection(db, 'leaves'),
          where('gatemanStatus', 'in', ['out', 'returned']),
          orderBy('exitTime', 'desc'),
          limit(5)
        );
        const recentActivitySnapshot = await getDocs(recentActivityQuery);
        const recentActivityData = recentActivitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setStats({
          pendingExits: pendingExitsSnapshot.size,
          pendingReturns: pendingReturnsSnapshot.size
        });
        setRecentActivity(recentActivityData);
        
      } catch (error) {
        console.error('Error fetching gateman dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGatemanDashboard();
  }, []);

  if (loading) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Welcome, {currentUser?.name}!
      </Typography>
      
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
                    primary={leave.studentName}
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
                          ? new Date(leave.exitTime).toLocaleString() 
                          : new Date(leave.returnTime).toLocaleString()}`}
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

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function AdminHome() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalGatemen: 0,
    pendingLeaves: 0,
    activeLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count students
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        // Count teachers
        const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
        const teachersSnapshot = await getDocs(teachersQuery);
        
        // Count gatemen
        const gatemenQuery = query(collection(db, 'users'), where('role', '==', 'gateman'));
        const gatemenSnapshot = await getDocs(gatemenQuery);
        
        // Count pending leaves
        const pendingLeavesQuery = query(collection(db, 'leaves'), where('status', '==', 'pending'));
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        
        // Count active leaves (approved but not completed)
        const activeLeavesQuery = query(
          collection(db, 'leaves'), 
          where('status', '==', 'approved')
        );
        const activeLeavesSnapshot = await getDocs(activeLeavesQuery);
        
        setStats({
          totalStudents: studentsSnapshot.size,
          totalTeachers: teachersSnapshot.size,
          totalGatemen: gatemenSnapshot.size,
          pendingLeaves: pendingLeavesSnapshot.size,
          activeLeaves: activeLeavesSnapshot.size
        });
        
        // Fetch recent leaves
        const recentLeavesQuery = query(
          collection(db, 'leaves'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentLeavesSnapshot = await getDocs(recentLeavesQuery);
        const recentLeavesData = recentLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentLeaves(recentLeavesData);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
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
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6">Students</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.totalStudents}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Total registered students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupervisorAccountIcon sx={{ mr: 1, color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6">Teachers</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.totalTeachers}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Total registered teachers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff8e1', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'warning.main', fontSize: 28 }} />
                <Typography variant="h6">Gatemen</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.totalGatemen}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Total registered gatemen
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'error.main', fontSize: 28 }} />
                <Typography variant="h6">Pending Leaves</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.pendingLeaves}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Leaves awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Leave Requests
            </Typography>
            <List>
              {recentLeaves.length > 0 ? (
                recentLeaves.map((leave, index) => (
                  <React.Fragment key={leave.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`${leave.studentName} - ${leave.type} Leave`}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              Status: {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Typography>
                            {` — ${new Date(leave.createdAt?.toDate()).toLocaleString()}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentLeaves.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent leave requests" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Active Leaves" 
                  secondary={`${stats.activeLeaves} students currently on approved leave`} 
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="User Management" 
                  secondary={`Total ${stats.totalStudents + stats.totalTeachers + stats.totalGatemen + 1} users in the system`} 
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Quick Actions" 
                  secondary="Use the sidebar to navigate to different management sections" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

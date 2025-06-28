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
  Divider
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function TeacherHome() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherDashboard = async () => {
      try {
        // Count assigned students
        const studentsQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'student'),
          where('assignedTeacher.id', '==', currentUser.uid)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        
        // Count pending leave requests
        const pendingLeavesQuery = query(
          collection(db, 'leaves'),
          where('teacherId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const pendingLeavesSnapshot = await getDocs(pendingLeavesQuery);
        
        // Fetch recent leave requests
        const recentLeavesQuery = query(
          collection(db, 'leaves'),
          where('teacherId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentLeavesSnapshot = await getDocs(recentLeavesQuery);
        const recentLeavesData = recentLeavesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setStats({
          totalStudents: studentsSnapshot.size,
          pendingLeaves: pendingLeavesSnapshot.size
        });
        setRecentLeaves(recentLeavesData);
        
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherDashboard();
  }, [currentUser]);

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
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6">My Students</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.totalStudents}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Students assigned to you
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/teacher/students')}
              >
                View Students
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: stats.pendingLeaves > 0 ? '#fff8e1' : '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: stats.pendingLeaves > 0 ? 'warning.main' : 'success.main', fontSize: 28 }} />
                <Typography variant="h6">Pending Requests</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.pendingLeaves}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Leave requests awaiting your approval
              </Typography>
              <Button 
                variant="outlined" 
                color={stats.pendingLeaves > 0 ? "warning" : "success"}
                onClick={() => navigate('/teacher/requests')}
              >
                {stats.pendingLeaves > 0 ? 'Review Requests' : 'No Pending Requests'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
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
                        {` — ${new Date(leave.fromDate).toLocaleString()} to ${new Date(leave.toDate).toLocaleString()}`}
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
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  Avatar,
  Chip
} from '@mui/material';

export default function MyStudents() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef, 
          where('role', '==', 'student'),
          where('assignedTeacher.id', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [currentUser]);

  if (loading) {
    return <Typography>Loading students...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Students
      </Typography>
      
      {students.length === 0 ? (
        <Typography>No students assigned to you yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      {student.name}
                    </Box>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Chip label="Assigned" color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

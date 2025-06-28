import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';

export default function AssignTeachers() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchStudentsAndTeachers = () => {
      // Fetch students
      const studentsRef = collection(db, 'users');
      const studentsQuery = query(
        studentsRef,
        where('role', '==', 'student'),
        orderBy('name')
      );
      
      const studentsUnsubscribe = onSnapshot(studentsQuery, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);
      });
      
      // Fetch teachers
      const teachersRef = collection(db, 'users');
      const teachersQuery = query(
        teachersRef,
        where('role', '==', 'teacher'),
        orderBy('name')
      );
      
      const teachersUnsubscribe = onSnapshot(teachersQuery, (snapshot) => {
        const teachersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeachers(teachersData);
        setLoading(false);
      });
      
      return () => {
        studentsUnsubscribe();
        teachersUnsubscribe();
      };
    };
    
    fetchStudentsAndTeachers();
  }, []);

  const handleAssignClick = (student) => {
    setSelectedStudent(student);
    setSelectedTeacherId(student.assignedTeacher?.id || '');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
    setSelectedTeacherId('');
  };

  const handleAssignTeacher = async () => {
    if (!selectedStudent) return;
    
    try {
      const studentRef = doc(db, 'users', selectedStudent.id);
      
      if (selectedTeacherId) {
        // Find the selected teacher
        const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
        
        await updateDoc(studentRef, {
          assignedTeacher: {
            id: selectedTeacherId,
            name: selectedTeacher.name
          }
        });
        
        toast.success(`Teacher ${selectedTeacher.name} assigned to ${selectedStudent.name}!`);
      } else {
        // Remove assigned teacher
        await updateDoc(studentRef, {
          assignedTeacher: null
        });
        
        toast.success(`Teacher unassigned from ${selectedStudent.name}!`);
      }
      
      handleDialogClose();
      
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast.error('Failed to assign teacher');
    }
  };

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Assign Teachers to Students
      </Typography>
      
      {students.length === 0 ? (
        <Typography>No students found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Assigned Teacher</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.assignedTeacher ? (
                      <Chip label={student.assignedTeacher.name} color="primary" />
                    ) : (
                      <Chip label="Not Assigned" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={() => handleAssignClick(student)}
                    >
                      {student.assignedTeacher ? 'Change' : 'Assign'} Teacher
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Teacher Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          Assign Teacher to {selectedStudent?.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Teacher</InputLabel>
            <Select
              value={selectedTeacherId}
              label="Teacher"
              onChange={(e) => setSelectedTeacherId(e.target.value)}
            >
              <MenuItem value="">
                <em>None (Unassign)</em>
              </MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAssignTeacher} color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

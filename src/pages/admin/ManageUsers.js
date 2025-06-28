import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab
} from '@mui/material';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('name'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        setLoading(false);
      });
      
      return unsubscribe;
    };
    
    const unsubscribe = fetchUsers();
    return () => unsubscribe();
  }, []);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteDoc(doc(db, 'users', selectedUser.id));
      toast.success(`User ${selectedUser.name} deleted successfully!`);
      handleDialogClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const filteredUsers = currentTab === 'all' 
    ? users 
    : users.filter(user => user.role === currentTab);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Chip label="Admin" color="error" />;
      case 'teacher':
        return <Chip label="Teacher" color="primary" />;
      case 'student':
        return <Chip label="Student" color="success" />;
      case 'gateman':
        return <Chip label="Gateman" color="warning" />;
      default:
        return <Chip label={role} />;
    }
  };

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Users
      </Typography>
      
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab value="all" label="All Users" />
        <Tab value="admin" label="Admins" />
        <Tab value="teacher" label="Teachers" />
        <Tab value="student" label="Students" />
        <Tab value="gateman" label="Gatemen" />
      </Tabs>
      
      {filteredUsers.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteClick(user)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

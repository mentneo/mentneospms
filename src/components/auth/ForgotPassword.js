import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar 
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email inbox for further instructions');
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Password Reset
        </Typography>
        {message && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2, textAlign: 'center' }}>
            {message}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </Button>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/login" variant="body2">
              Back to Login
            </Link>
            <Link to="/register" variant="body2">
              Need an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

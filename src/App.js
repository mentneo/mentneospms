import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Dashboard Components
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import GatemanDashboard from './pages/gateman/Dashboard';

// Gateman Pages
import GatemanHome from './pages/gateman/Home';
import ApprovedLeaves from './pages/gateman/ApprovedLeaves';
import LeaveHistory from './pages/gateman/LeaveHistory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { currentUser } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          currentUser?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher/*" element={
          currentUser?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" replace />
        } />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          currentUser?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" replace />
        } />
        
        {/* Gateman Routes */}
        <Route path="/gateman/*" element={
          currentUser?.role === 'gateman' ? <GatemanDashboard /> : <Navigate to="/login" replace />
        }>
          <Route index element={<GatemanHome />} />
          <Route path="approved" element={<ApprovedLeaves />} />
          <Route path="history" element={<LeaveHistory />} />
        </Route>
        
        {/* Default redirect based on user role */}
        <Route path="/" element={
          currentUser ? <Navigate to={`/${currentUser.role}`} replace /> : <Navigate to="/login" replace />
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;

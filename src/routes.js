import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard Components
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import GatemanDashboard from './pages/gateman/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Route Definitions
const AppRoutes = () => {
  const { currentUser, userRole } = useAuth();
  
  // Redirect to appropriate dashboard based on user role
  const handleRootRedirect = () => {
    if (!currentUser) return <Navigate to="/login" />;
    
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'teacher':
        return <Navigate to="/teacher" />;
      case 'student':
        return <Navigate to="/student" />;
      case 'gateman':
        return <Navigate to="/gateman" />;
      default:
        return <Navigate to="/login" />;
    }
  };
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={currentUser ? handleRootRedirect() : <Login />} />
      <Route path="/register" element={currentUser ? handleRootRedirect() : <Register />} />
      
      {/* Protected Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/teacher/*" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/gateman/*" element={
        <ProtectedRoute allowedRoles={['gateman']}>
          <GatemanDashboard />
        </ProtectedRoute>
      } />
      
      {/* Root Route */}
      <Route path="/" element={handleRootRedirect()} />
      
      {/* 404 Route */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Admin Components
import AdminHome from './Home';
import ManageUsers from './ManageUsers';
import ViewLeaves from './ViewLeaves';
import AssignTeachers from './AssignTeachers';

export default function AdminDashboard() {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'View Leaves', icon: <AssignmentIcon />, path: '/admin/leaves' },
    { text: 'Assign Teachers', icon: <PersonAddIcon />, path: '/admin/assign' }
  ];

  return (
    <Layout title="Admin Dashboard" menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/leaves" element={<ViewLeaves />} />
        <Route path="/assign" element={<AssignTeachers />} />
      </Routes>
    </Layout>
  );
}

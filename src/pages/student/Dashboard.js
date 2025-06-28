import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';

// Student Components
import StudentHome from './Home';
import ApplyLeave from './ApplyLeave';
import ViewLeaves from './ViewLeaves';

export default function StudentDashboard() {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { text: 'Apply for Leave', icon: <NoteAddIcon />, path: '/student/apply' },
    { text: 'My Leaves', icon: <ListAltIcon />, path: '/student/leaves' }
  ];

  return (
    <Layout title="Student Dashboard" menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/apply" element={<ApplyLeave />} />
        <Route path="/leaves" element={<ViewLeaves />} />
      </Routes>
    </Layout>
  );
}

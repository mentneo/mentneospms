import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';

// Teacher Components
import TeacherHome from './Home';
import LeaveRequests from './LeaveRequests';
import MyStudents from './MyStudents';
import LeaveHistory from './LeaveHistory';

export default function TeacherDashboard() {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher' },
    { text: 'Leave Requests', icon: <AssignmentIcon />, path: '/teacher/requests' },
    { text: 'My Students', icon: <PeopleIcon />, path: '/teacher/students' },
    { text: 'Leave History', icon: <HistoryIcon />, path: '/teacher/history' }
  ];

  return (
    <Layout title="Teacher Dashboard" menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/requests" element={<LeaveRequests />} />
        <Route path="/students" element={<MyStudents />} />
        <Route path="/history" element={<LeaveHistory />} />
      </Routes>
    </Layout>
  );
}

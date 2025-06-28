import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';

// Gateman Components
import GatemanHome from './Home';
import ApprovedLeaves from './ApprovedLeaves';
import LeaveHistory from './LeaveHistory';

export default function GatemanDashboard() {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/gateman' },
    { text: 'Approved Leaves', icon: <AssignmentIcon />, path: '/gateman/approved' },
    { text: 'Leave History', icon: <HistoryIcon />, path: '/gateman/history' }
  ];

  return (
    <Layout title="Gateman Dashboard" menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<GatemanHome />} />
        <Route path="/approved" element={<ApprovedLeaves />} />
        <Route path="/history" element={<LeaveHistory />} />
      </Routes>
    </Layout>
  );
}

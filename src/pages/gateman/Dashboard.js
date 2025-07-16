import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';

export default function GatemanDashboard() {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/gateman' },
    { text: 'Approved Leaves', icon: <AssignmentIcon />, path: '/gateman/approved' },
    { text: 'Leave History', icon: <HistoryIcon />, path: '/gateman/history' }
  ];

  return (
    <Layout title="Gateman Dashboard" menuItems={menuItems}>
      <Outlet />
    </Layout>
  );
}

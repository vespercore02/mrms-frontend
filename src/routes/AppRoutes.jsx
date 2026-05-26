import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Requests from '../pages/Requests';
import Departments from '../pages/Departments';
import Series from '../pages/Series';
import Specifics from '../pages/Specifics';
import Users from '../pages/Users';
import AuditLogs from '../pages/AuditLogs';
import RequestDetails from '../pages/RequestDetails';
import CreateRequest from '../pages/CreateRequest';

import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const withLayout = (page) => (
  <ProtectedRoute>
    <Layout>{page}</Layout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={withLayout(<Dashboard />)} />
        <Route path="/requests" element={withLayout(<Requests />)} />
        <Route path="/departments" element={withLayout(<Departments />)} />
        <Route path="/series" element={withLayout(<Series />)} />
        <Route path="/specifics" element={withLayout(<Specifics />)} />
        <Route path="/users" element={withLayout(<Users />)} />
        <Route path="/audit-logs" element={withLayout(<AuditLogs />)} />
        <Route path="/requests/:id" element={withLayout(<RequestDetails />)} />
        <Route path="/requests/create" element={withLayout(<CreateRequest />)} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Requests from '../pages/Requests';
import Departments from '../pages/Departments';
import RDS from '../pages/RDS';
import Users from '../pages/Users';
import AuditLogs from '../pages/AuditLogs';
import AgencyForms from '../pages/AgencyForms';

import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

import Cabinets from "../pages/Cabinets";
import CabinetDetails from "../pages/CabinetDetails";
import CabinetBayDetails from "../pages/CabinetBayDetails";
import StorageBoxDetails from "../pages/StorageBoxDetails";
import RecordLocations from "../pages/RecordLocations";
import FloorMap from "../pages/FloorMap";

import CreateRequest from '../pages/CreateRequest';
import CreateRequestV2 from "../pages/CreateRequestV2";

import RequestDetails from '../pages/RequestDetails';
import RequestFormDetails from "../pages/RequestFormDetails";

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
        <Route path="/departments" element={withLayout(<Departments />)} />
        <Route path="/rds" element={withLayout(<RDS />)} />
        <Route path="/users" element={withLayout(<Users />)} />
        <Route path="/audit-logs" element={withLayout(<AuditLogs />)} />

        <Route path="/agency-forms" element={withLayout(<AgencyForms />)} />

        <Route path="/cabinets" element={withLayout(<Cabinets />)} />
        <Route path="/cabinets/:id" element={withLayout(<CabinetDetails />)} />
        <Route path="/cabinet-bays/:id" element={withLayout(<CabinetBayDetails />)} />
        <Route path="/storage-boxes/:id" element={withLayout(<StorageBoxDetails />)} />
        <Route path="/record-locations" element={withLayout(<RecordLocations />)} />
        <Route path="/floor-map" element={withLayout(<FloorMap />)} />
        
        <Route path="/requests" element={withLayout(<Requests />)} />
        
        <Route path="/requests/create" element={withLayout(<CreateRequestV2 />)} />
        <Route path="/requests/create-v2" element={<Navigate to="/requests/create" replace />} />

        <Route path="/requests/:id" element={withLayout(<RequestDetails />)} />
        <Route path="/request-forms/:id" element={withLayout(<RequestFormDetails />)} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import GuardedLayout from './routes/GuardedLayout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Reports from './pages/reports/Reports.jsx';
import SubModuleGuard from './routes/SubModuleGuard.jsx';
import ServiceRecords from './pages/service-records/ServiceRecords.jsx';
import ServiceBook from './pages/service-records/ServiceBook.jsx';
import SettingsHub from './pages/settings/SettingsHub.jsx';
import EmployeeList from './pages/settings/employees/EmployeeList.jsx';
import LeaveSetup from './pages/settings/leave/LeaveSetup.jsx';
import LoanSetup from './pages/settings/loan/LoanSetup.jsx';
import LeaveTransactions from './pages/transactions/leaves/LeaveTransactions.jsx';
import LoanTransactions from './pages/transactions/loans/LoanTransactions.jsx';
import { ROLES } from './constants/roles.js';

const ADMIN = ROLES.CLIENT_ADMIN;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoutes />}>
          <Route element={<GuardedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/settings"
              element={
                <SubModuleGuard roles={[ADMIN]}>
                  <SettingsHub />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/employees/*"
              element={
                <SubModuleGuard roles={[ADMIN]}>
                  <EmployeeList />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/loan/*"
              element={
                <SubModuleGuard roles={[ADMIN]}>
                  <LoanSetup />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/leave/*"
              element={
                <SubModuleGuard roles={[ADMIN]}>
                  <LeaveSetup />
                </SubModuleGuard>
              }
            />

            <Route path="/service-records/book" element={<ServiceBook />} />
            <Route path="/transactions/loans/*" element={<LoanTransactions />} />
            <Route path="/transactions/leaves/*" element={<LeaveTransactions />} />
            <Route path="/transactions/service-records/*" element={<ServiceRecords />} />

            <Route
              path="/service-records/*"
              element={<Navigate to="/transactions/service-records" replace />}
            />
            <Route path="/reports/*" element={<Reports />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

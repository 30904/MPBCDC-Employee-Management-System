import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import SubModuleGuard from './routes/SubModuleGuard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Reports from './pages/reports/Reports.jsx';
import ServiceRecords from './pages/service-records/ServiceRecords.jsx';
import EmployeeList from './pages/settings/employees/EmployeeList.jsx';
import LeaveSetup from './pages/settings/leave/LeaveSetup.jsx';
import LoanSetup from './pages/settings/loan/LoanSetup.jsx';
import NotificationTemplates from './pages/settings/notifications/NotificationTemplates.jsx';
import OrganizationSetup from './pages/settings/organization/OrganizationSetup.jsx';
import UserManagement from './pages/settings/users/UserManagement.jsx';
import ApprovalMatrix from './pages/settings/workflow/ApprovalMatrix.jsx';
import LeaveTransactions from './pages/transactions/leaves/LeaveTransactions.jsx';
import LoanTransactions from './pages/transactions/loans/LoanTransactions.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoutes />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/settings/organization"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <OrganizationSetup />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/employees"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER']}>
                  <EmployeeList />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/loan"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LoanSetup />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/leave"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LeaveSetup />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/workflow"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <ApprovalMatrix />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <NotificationTemplates />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/users"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <UserManagement />
                </SubModuleGuard>
              }
            />

            <Route
              path="/transactions/loans"
              element={
                <SubModuleGuard
                  roles={[
                    'CLIENT_ADMIN',
                    'HR_OFFICER',
                    'FINANCE_OFFICER',
                    'REPORTING_MANAGER',
                  ]}
                >
                  <LoanTransactions />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/leaves"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER', 'REPORTING_MANAGER']}>
                  <LeaveTransactions />
                </SubModuleGuard>
              }
            />
            <Route
              path="/service-records"
              element={
                <SubModuleGuard
                  roles={[
                    'CLIENT_ADMIN',
                    'HR_OFFICER',
                    'REPORTING_MANAGER',
                    'REGIONAL_MANAGER',
                  ]}
                >
                  <ServiceRecords />
                </SubModuleGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <SubModuleGuard
                  roles={[
                    'CLIENT_ADMIN',
                    'HR_OFFICER',
                    'FINANCE_OFFICER',
                    'REPORTING_MANAGER',
                    'REGIONAL_MANAGER',
                  ]}
                >
                  <Reports />
                </SubModuleGuard>
              }
            />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

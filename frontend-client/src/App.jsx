import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import GuardedLayout from './routes/GuardedLayout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
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
          <Route element={<GuardedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings/organization/*" element={<OrganizationSetup />} />
            <Route path="/settings/employees/*" element={<EmployeeList />} />
            <Route path="/settings/loan/*" element={<LoanSetup />} />
            <Route path="/settings/leave/*" element={<LeaveSetup />} />
            <Route path="/settings/workflow/*" element={<ApprovalMatrix />} />
            <Route path="/settings/notifications/*" element={<NotificationTemplates />} />
            <Route path="/settings/users/*" element={<UserManagement />} />
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

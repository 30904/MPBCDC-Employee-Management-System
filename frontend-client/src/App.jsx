import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import GuardedLayout from './routes/GuardedLayout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Reports from './pages/reports/Reports.jsx';
import SubModuleGuard from './routes/SubModuleGuard.jsx';
import ServiceRecords from './pages/service-records/ServiceRecords.jsx';
import ServiceBook from './pages/service-records/ServiceBook.jsx';
import EmployeeList from './pages/settings/employees/EmployeeList.jsx';
import Departments from './pages/settings/organization/Departments.jsx';
import Designations from './pages/settings/organization/Designations.jsx';
import Grades from './pages/settings/organization/Grades.jsx';
import Regions from './pages/settings/organization/Regions.jsx';
import Districts from './pages/settings/organization/Districts.jsx';
import LeaveSetup from './pages/settings/leave/LeaveSetup.jsx';
import LeaveTypes from './pages/settings/leave/LeaveTypes.jsx';
import HolidayCalendar from './pages/settings/leave/HolidayCalendar.jsx';
import LeaveAccrual from './pages/settings/leave/LeaveAccrual.jsx';
import LeaveWorkflow from './pages/settings/leave/LeaveWorkflow.jsx';
import LoanSetup from './pages/settings/loan/LoanSetup.jsx';
import NotificationTemplates from './pages/settings/notifications/NotificationTemplates.jsx';
import NotificationCenter from './pages/settings/notifications/NotificationCenter.jsx';
import OrganizationSetup from './pages/settings/organization/OrganizationSetup.jsx';
import UserManagement from './pages/settings/users/UserManagement.jsx';
import RoleAssignment from './pages/settings/users/RoleAssignment.jsx';
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

            <Route
              path="/settings/organization"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <OrganizationSetup />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/organization/departments"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <Departments />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/organization/designations"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <Designations />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/organization/grades"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <Grades />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/organization/regions"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <Regions />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/organization/districts"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <Districts />
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
              path="/settings/leave/types"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LeaveTypes />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/leave/holidays"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <HolidayCalendar />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/leave/accrual"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LeaveAccrual />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/leave/workflow"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LeaveWorkflow />
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
              path="/settings/workflow/approval-matrix"
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
              path="/settings/notifications/templates"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <NotificationCenter />
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
              path="/settings/users/roles"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <RoleAssignment />
                </SubModuleGuard>
              }
            />
            <Route path="/service-records/book" element={<ServiceBook />} />

            <Route path="/settings/organization/*" element={<OrganizationSetup />} />
            <Route
              path="/settings/employees/*"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER']}>
                  <EmployeeList />
                </SubModuleGuard>
              }
            />
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
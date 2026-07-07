import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import SubModuleGuard from './routes/SubModuleGuard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Reports from './pages/reports/Reports.jsx';
import EmployeeForm from './pages/settings/employees/EmployeeForm.jsx';
import EmployeeDetails from './pages/settings/employees/EmployeeDetails.jsx';
import DepartmentMaster from './pages/settings/organization/DepartmentMaster.jsx';
import Designations from './pages/settings/organization/Designations.jsx';
import Districts from './pages/settings/organization/Districts.jsx';
import Grades from './pages/settings/organization/Grades.jsx';
import Regions from './pages/settings/organization/Regions.jsx';
import ServiceRecords from './pages/service-records/ServiceRecords.jsx';
import EmployeeList from './pages/settings/employees/EmployeeList.jsx';
import LoanTypes from './pages/settings/loan/LoanTypes.jsx';
import LoanEligibility from './pages/settings/loan/LoanEligibility.jsx';
import LoanWorkflow from './pages/settings/loan/LoanWorkflow.jsx';
import LoanApplications from './pages/transactions/loans/LoanApplications.jsx';
import LoanApprovalQueue from './pages/transactions/loans/LoanApprovalQueue.jsx';
import LoanDisbursement from './pages/transactions/loans/LoanDisbursement.jsx';
import LeaveSetup from './pages/settings/leave/LeaveSetup.jsx';
import LeaveTypes from './pages/settings/leave/LeaveTypes.jsx';
import HolidayCalendar from './pages/settings/leave/HolidayCalendar.jsx';
import LeaveAccrual from './pages/settings/leave/LeaveAccrual.jsx';
import LeaveWorkflow from './pages/settings/leave/LeaveWorkflow.jsx';
import LeaveApplications from './pages/transactions/leaves/LeaveApplications.jsx';
import LeaveApprovalQueue from './pages/transactions/leaves/LeaveApprovalQueue.jsx';
import LoanSetup from './pages/settings/loan/LoanSetup.jsx';
import NotificationTemplates from './pages/settings/notifications/NotificationTemplates.jsx';
import NotificationCenter from './pages/settings/notifications/NotificationCenter.jsx';
import OrganizationSetup from './pages/settings/organization/OrganizationSetup.jsx';
import UserManagement from './pages/settings/users/UserManagement.jsx';
import RoleAssignment from './pages/settings/users/RoleAssignment.jsx';
import ApprovalMatrix from './pages/settings/workflow/ApprovalMatrix.jsx';
import LeaveTransactions from './pages/transactions/leaves/LeaveTransactions.jsx';
import LoanTransactions from './pages/transactions/loans/LoanTransactions.jsx';
import ServiceBook from './pages/service-records/ServiceBook.jsx';

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
              path="/settings/organization/departments"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <DepartmentMaster />
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
              path="/settings/employees"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER']}>
                  <EmployeeList />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/employees/create"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER']}>
                  <EmployeeForm />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/employees/:id"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER']}>
                  <EmployeeDetails />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/employees/:id/edit"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER']}>
                  <EmployeeForm mode="edit" />
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
              path="/settings/loan/types"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LoanTypes />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/loan/eligibility"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LoanEligibility />
                </SubModuleGuard>
              }
            />
            <Route
              path="/settings/loan/workflow"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN']}>
                  <LoanWorkflow />
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

            <Route
              path="/transactions/loans"
              element={
                <SubModuleGuard
                  roles={['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER']}
                >
                  <LoanTransactions />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/loans/applications"
              element={
                <SubModuleGuard roles={['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER']}>
                  <LoanApplications />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/loans/approval-queue"
              element={
                <SubModuleGuard roles={['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER']}>
                  <LoanApprovalQueue />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/loans/disbursement"
              element={
                <SubModuleGuard roles={['HR_OFFICER', 'FINANCE_OFFICER', 'REPORTING_MANAGER']}>
                  <LoanDisbursement />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/leaves"
              element={
                <SubModuleGuard roles={['HR_OFFICER', 'REPORTING_MANAGER']}>
                  <LeaveTransactions />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/leaves/applications"
              element={
                <SubModuleGuard roles={['HR_OFFICER', 'REPORTING_MANAGER']}>
                  <LeaveApplications />
                </SubModuleGuard>
              }
            />
            <Route
              path="/transactions/leaves/approval-queue"
              element={
                <SubModuleGuard roles={['HR_OFFICER', 'REPORTING_MANAGER']}>
                  <LeaveApprovalQueue />
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
                  ]}
                >
                  <ServiceRecords />
                </SubModuleGuard>
              }
            />
            <Route
              path="/service-records/book"
              element={
                <SubModuleGuard roles={['CLIENT_ADMIN', 'HR_OFFICER', 'REPORTING_MANAGER']}>
                  <ServiceBook />
                </SubModuleGuard>
              }
            />
            <Route
              path="/reports/*"
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

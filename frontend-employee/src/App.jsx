import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import SubModuleGuard from './routes/SubModuleGuard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Documents from './pages/Documents.jsx';
import Login from './pages/Login.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import ApplyLeave from './pages/leaves/ApplyLeave.jsx';
import LeaveBalance from './pages/leaves/LeaveBalance.jsx';
import LeaveHistory from './pages/leaves/LeaveHistory.jsx';
import ApplyLoan from './pages/loans/ApplyLoan.jsx';
import AppliedLoans from './pages/loans/AppliedLoans.jsx';
import RepaymentSchedule from './pages/loans/RepaymentSchedule.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoutes />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/leaves/apply"
              element={
                <SubModuleGuard>
                  <ApplyLeave />
                </SubModuleGuard>
              }
            />
            <Route
              path="/leaves/history"
              element={
                <SubModuleGuard>
                  <LeaveHistory />
                </SubModuleGuard>
              }
            />
            <Route
              path="/leaves/balance"
              element={
                <SubModuleGuard>
                  <LeaveBalance />
                </SubModuleGuard>
              }
            />

            <Route
              path="/loans/apply"
              element={
                <SubModuleGuard>
                  <ApplyLoan />
                </SubModuleGuard>
              }
            />
            <Route
              path="/loans/applied"
              element={
                <SubModuleGuard>
                  <AppliedLoans />
                </SubModuleGuard>
              }
            />
            <Route
              path="/loans/:id/schedule"
              element={
                <SubModuleGuard>
                  <RepaymentSchedule />
                </SubModuleGuard>
              }
            />

            <Route
              path="/profile"
              element={
                <SubModuleGuard>
                  <Profile />
                </SubModuleGuard>
              }
            />
            <Route
              path="/documents"
              element={
                <SubModuleGuard>
                  <Documents />
                </SubModuleGuard>
              }
            />
            <Route
              path="/notifications"
              element={
                <SubModuleGuard>
                  <Notifications />
                </SubModuleGuard>
              }
            />
          </Route>

          <Route path="/settings/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

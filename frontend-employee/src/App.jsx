import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import GuardedLayout from './routes/GuardedLayout.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import SettingsBlockedRedirect from './routes/SettingsBlockedRedirect.jsx';
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
          <Route element={<GuardedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaves/apply" element={<ApplyLeave />} />
            <Route path="/leaves/history" element={<LeaveHistory />} />
            <Route path="/leaves/balance" element={<LeaveBalance />} />
            <Route path="/loans/apply" element={<ApplyLoan />} />
            <Route path="/loans/applied" element={<AppliedLoans />} />
            <Route path="/loans/:id/schedule" element={<RepaymentSchedule />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route path="/settings/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/settings/*" element={<SettingsBlockedRedirect />} />

<Route path="/" element={<Navigate to="/dashboard" replace />} />
<Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

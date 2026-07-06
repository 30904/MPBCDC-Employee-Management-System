
import { Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import LeaveApplications from './LeaveApplications.jsx';
import LeaveApprovals from './LeaveApprovals.jsx';
import LeaveBalances from './LeaveBalances.jsx';

const TABS = [
  { path: 'applications', label: 'Applications', end: true },
  { path: 'approvals', label: 'Approver Queue', end: true },
  { path: 'balances', label: 'Balances', end: true },
];

export default function LeaveTransactions() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Leave Transactions"
            subtitle="Leave applications, approvals, and balance reports"
            tabs={TABS}
          />
        }
      >
        <Route index element={<Navigate to="applications" replace />} />
        <Route path="applications" element={<LeaveApplications />} />
        <Route path="approvals" element={<LeaveApprovals />} />
        <Route path="balances" element={<LeaveBalances />} />
      </Route>
    </Routes>
  );
}

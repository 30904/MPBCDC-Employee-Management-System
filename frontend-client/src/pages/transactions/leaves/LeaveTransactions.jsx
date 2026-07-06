<<<<<<< HEAD
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
=======
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function LeaveTransactions() {
  return (
    <div>
      <PageHeader title="Leave Transactions" subtitle="Applications and approval queue" />
      <div className="card-grid">
        <Link className="card nav-card" to="/transactions/leaves/applications">
          <h3>Leave Applications</h3>
          <p>Review submitted leave applications.</p>
        </Link>
        <Link className="card nav-card" to="/transactions/leaves/approval-queue">
          <h3>Leave Approval Queue</h3>
          <p>Process pending leave approvals.</p>
        </Link>
      </div>
    </div>
>>>>>>> origin/dev-nicole
  );
}

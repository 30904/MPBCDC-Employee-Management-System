<<<<<<< HEAD
import { Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import LoanApplications from './LoanApplications.jsx';
import LoanApprovals from './LoanApprovals.jsx';
import LoanDisbursement from './LoanDisbursement.jsx';

const TABS = [
  { path: 'applications', label: 'Applications', end: true },
  { path: 'approvals', label: 'Approver Queue', end: true },
  { path: 'disbursement', label: 'Disbursement', end: true },
];

export default function LoanTransactions() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Loan Transactions"
            subtitle="Applications, approvals, disbursement, EMI, recovery, closure"
            tabs={TABS}
          />
        }
      >
        <Route index element={<Navigate to="applications" replace />} />
        <Route path="applications" element={<LoanApplications />} />
        <Route path="approvals" element={<LoanApprovals />} />
        <Route path="disbursement" element={<LoanDisbursement />} />
      </Route>
    </Routes>
=======
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function LoanTransactions() {
  return (
    <div>
      <PageHeader title="Loan Transactions" subtitle="Applications and approval workflow" />
      <div className="card-grid">
        <Link className="card nav-card" to="/transactions/loans/applications">
          <h3>Loan Applications</h3>
          <p>Review submitted loan applications.</p>
        </Link>
        <Link className="card nav-card" to="/transactions/loans/approval-queue">
          <h3>Loan Approval Queue</h3>
          <p>Process pending loan approvals.</p>
        </Link>
        <Link className="card nav-card" to="/transactions/loans/disbursement">
          <h3>Loan Disbursement</h3>
          <p>Track loan release actions.</p>
        </Link>
      </div>
    </div>
>>>>>>> origin/dev-nicole
  );
}

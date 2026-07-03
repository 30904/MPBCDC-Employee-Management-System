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
  );
}

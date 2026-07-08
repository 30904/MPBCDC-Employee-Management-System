import { Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import LoanApplications from './LoanApplications.jsx';
import LoanApplicationDetails from './LoanApplicationDetails.jsx';
import LoanApprovalQueue from './LoanApprovalQueue.jsx';
import LoanDisbursement from './LoanDisbursement.jsx';
import LoanRecoveryRegister from './LoanRecoveryRegister.jsx';
import EmiScheduleView from './EmiScheduleView.jsx';

const TABS = [
  { path: 'applications', label: 'Applications', end: true },
  { path: 'approvals', label: 'Approver Queue', end: true },
  { path: 'disbursement', label: 'Disbursement', end: true },
  { path: 'emi-schedule', label: 'EMI Schedule', end: true },
  { path: 'recovery', label: 'Recovery', end: true },
];

export default function LoanTransactions() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Loan Transactions"
            subtitle="Applications, admin approval, disbursement, EMI, and recovery"
            tabs={TABS}
          />
        }
      >
        <Route index element={<Navigate to="applications" replace />} />
        <Route path="applications" element={<LoanApplications />} />
        <Route path="applications/:id" element={<LoanApplicationDetails />} />
        <Route path="approvals" element={<LoanApprovalQueue />} />
        <Route path="disbursement" element={<LoanDisbursement />} />
        <Route path="emi-schedule" element={<EmiScheduleView />} />
        <Route path="recovery" element={<LoanRecoveryRegister />} />
      </Route>
    </Routes>
  );
}

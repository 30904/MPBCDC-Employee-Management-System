
import { Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import LoanEligibilitySetup from './LoanEligibilitySetup.jsx';
import LoanTypeList from './LoanTypeList.jsx';
import LoanWorkflowSetup from './LoanWorkflowSetup.jsx';

const TABS = [
  { path: 'types', label: 'Loan Types', end: true },
  { path: 'eligibility', label: 'Eligibility', end: true },
  { path: 'workflow', label: 'Workflow', end: true },
];

export default function LoanSetup() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Loan Setup"
            subtitle="Loan types, eligibility rules, and approval workflow"
            tabs={TABS}
          />
        }
      >
        <Route index element={<Navigate to="types" replace />} />
        <Route path="types" element={<LoanTypeList />} />
        <Route path="eligibility" element={<LoanEligibilitySetup />} />
        <Route path="workflow" element={<LoanWorkflowSetup />} />
      </Route>
    </Routes>

  );
}

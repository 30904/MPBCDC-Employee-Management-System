
import { Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import HolidayList from './HolidayList.jsx';
import LeaveAccrualSetup from './LeaveAccrualSetup.jsx';
import LeaveTypeList from './LeaveTypeList.jsx';
import LeaveWorkflowSetup from './LeaveWorkflowSetup.jsx';

const TABS = [
  { path: 'types', label: 'Leave Types', end: true },
  { path: 'holidays', label: 'Holidays', end: true },
  { path: 'accrual', label: 'Accrual Rules', end: true },
  { path: 'workflow', label: 'Workflow', end: true },
];

export default function LeaveSetup() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Leave Setup"
            subtitle="Leave types, holidays, accrual rules, and approval workflow"
            tabs={TABS}
          />
        }
      >
        <Route index element={<Navigate to="types" replace />} />
        <Route path="types" element={<LeaveTypeList />} />
        <Route path="holidays" element={<HolidayList />} />
        <Route path="accrual" element={<LeaveAccrualSetup />} />
        <Route path="workflow" element={<LeaveWorkflowSetup />} />
      </Route>
    </Routes>

  );
}

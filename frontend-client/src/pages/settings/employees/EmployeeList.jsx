import { Link, Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import EmployeeForm from './EmployeeForm.jsx';
import EmployeeIndex from './EmployeeIndex.jsx';

const TABS = [
  { path: 'list', label: 'All Employees', end: true },
  { path: 'new', label: 'Add Employee', end: true },
];

export default function EmployeeList() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Employee Master"
            subtitle="Create and maintain slim MPBCDC employee records"
            tabs={TABS}
            action={
              <Link to="/settings/employees/new" className="primary-btn">
                + Add Employee
              </Link>
            }
          />
        }
      >
        <Route index element={<Navigate to="list" replace />} />
        <Route path="list" element={<EmployeeIndex />} />
        <Route path="new" element={<EmployeeForm />} />
      </Route>
    </Routes>
  );
}

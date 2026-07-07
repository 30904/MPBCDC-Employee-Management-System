import EmployeeForm from './EmployeeForm.jsx';

export default function EmployeeCreate({ mode = 'create' }) {
  return <EmployeeForm mode={mode} />;
}
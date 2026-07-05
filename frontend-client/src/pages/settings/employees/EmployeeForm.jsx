import ModuleSection from '../../../components/ModuleSection.jsx';

export default function EmployeeForm() {
  return (
    <ModuleSection
      title="Add Employee"
      description="Create a new employee record for this tenant."
      endpoints={['POST /api/employees']}
    />
  );
}

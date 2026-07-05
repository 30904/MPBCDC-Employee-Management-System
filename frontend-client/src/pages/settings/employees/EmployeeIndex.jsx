import ModuleSection from '../../../components/ModuleSection.jsx';

export default function EmployeeIndex() {
  return (
    <ModuleSection
      title="Employee List"
      description="Search, filter, and maintain slim MPBCDC employee records."
      endpoints={['GET /api/employees', 'GET /api/employees/:id']}
    />
  );
}

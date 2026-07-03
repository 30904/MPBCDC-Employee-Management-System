import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function EmployeeList() {
  return (
    <PlaceholderPage
      title="Employee Master"
      subtitle="Create and maintain slim MPBCDC employee records"
      endpoints={['GET/POST/PUT /api/employees']}
    />
  );
}

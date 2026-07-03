import PlaceholderPage from '../components/PlaceholderPage.jsx';

export default function Profile() {
  return (
    <PlaceholderPage
      title="My Profile"
      subtitle="Read-only view — name, department, designation, grade, manager, joining date"
      endpoints={['GET /api/employees/me']}
    />
  );
}

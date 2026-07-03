import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function UserManagement() {
  return (
    <PlaceholderPage
      title="Users & Roles"
      subtitle="Assign login accounts and roles to employees"
      endpoints={['GET/POST/PUT /api/users', 'POST /api/auth/login']}
    />
  );
}

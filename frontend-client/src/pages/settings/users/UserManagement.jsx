import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function UserManagement() {
  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Client admin user access and role mapping" />
      <div className="card-grid">
        <Link className="card nav-card" to="/settings/users/roles">
          <h3>Role Assignment</h3>
          <p>Assign access roles to user accounts.</p>
        </Link>
      </div>
    </div>
  );
}

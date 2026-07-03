import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

export default function CompanyUsers() {
  const { id } = useParams();

  return (
    <div>
      <PageHeader
        title="Client Admin Users"
        subtitle={`Provision CLIENT_ADMIN users for company ${id}`}
        action={
          <button type="button" className="primary-btn">
            + Add User
          </button>
        }
      />
      <div className="card">
        <p className="placeholder-text">
          User provisioning will connect to <code>POST /api/users</code> in the backend phase.
        </p>
        <Link to={`/companies/${id}`}>← Back to company detail</Link>
      </div>
    </div>
  );
}

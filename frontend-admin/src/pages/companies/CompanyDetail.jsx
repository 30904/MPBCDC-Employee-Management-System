import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

export default function CompanyDetail() {
  const { id } = useParams();

  return (
    <div>
      <PageHeader
        title="Company Detail"
        subtitle={`Tenant ID: ${id}`}
        action={
          <Link to={`/companies/${id}/users`} className="primary-btn">
            Manage Client Admin Users
          </Link>
        }
      />
      <div className="card">
        <h3>Module Flags</h3>
        <ul className="module-flags">
          <li>Loan Management</li>
          <li>Leave Management</li>
          <li>Employee Service Records</li>
        </ul>
        <Link to="/companies">← Back to companies</Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

export default function CompanyList() {
  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Create and manage MPBCDC tenant companies"
        action={
          <button type="button" className="primary-btn">
            + New Company
          </button>
        }
      />
      <div className="card">
        <p className="placeholder-text">
          Company list will load from <code>GET /api/companies</code> once the backend is ready.
        </p>
        <Link to="/companies/sample-id">View sample company detail →</Link>
      </div>
    </div>
  );
}

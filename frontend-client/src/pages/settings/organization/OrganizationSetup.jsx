import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function OrganizationSetup() {
  return (
    <div>
      <PageHeader
        title="Organization Setup"
        subtitle="Master data setup for the HRMS"
      />
      <div className="card-grid">
        <Link className="card nav-card" to="/settings/organization/departments">
          <h3>Departments</h3>
          <p>Define department structure for the company.</p>
        </Link>
        <Link className="card nav-card" to="/settings/organization/designations">
          <h3>Designations</h3>
          <p>Maintain job titles and reporting labels.</p>
        </Link>
        <Link className="card nav-card" to="/settings/organization/grades">
          <h3>Grades</h3>
          <p>Configure grade bands and internal levels.</p>
        </Link>
        <Link className="card nav-card" to="/settings/organization/regions">
          <h3>Regions</h3>
          <p>Set up regional groups for organizational hierarchy.</p>
        </Link>
        <Link className="card nav-card" to="/settings/organization/districts">
          <h3>Districts</h3>
          <p>Define district masters linked to regional structure.</p>
        </Link>
      </div>
    </div>
  );
}

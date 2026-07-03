import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function LoanSetup() {
  return (
    <div>
      <PageHeader title="Loan Setup" subtitle="Loan master setup for the client portal" />
      <div className="card-grid">
        <Link className="card nav-card" to="/settings/loan/types">
          <h3>Loan Types</h3>
          <p>Define loan products and setup options.</p>
        </Link>
        <Link className="card nav-card" to="/settings/loan/eligibility">
          <h3>Loan Eligibility</h3>
          <p>Configure eligibility rules and criteria.</p>
        </Link>
        <Link className="card nav-card" to="/settings/loan/workflow">
          <h3>Loan Workflow</h3>
          <p>Define approval and review flow.</p>
        </Link>
      </div>
    </div>
  );
}

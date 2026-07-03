import { Link } from 'react-router-dom';
import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function AppliedLoans() {
  return (
    <div>
      <PlaceholderPage
        title="My Loans"
        subtitle="Track loan applications and their approval status"
        endpoints={['GET /api/loan-applications (self only)']}
      />
      <div className="card card-link">
        <Link to="/loans/sample-id/schedule">View sample EMI schedule →</Link>
      </div>
    </div>
  );
}

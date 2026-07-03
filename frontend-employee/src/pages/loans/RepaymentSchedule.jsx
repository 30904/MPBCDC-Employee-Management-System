import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

export default function RepaymentSchedule() {
  const { id } = useParams();

  return (
    <div>
      <PageHeader
        title="EMI Repayment Schedule"
        subtitle={`Loan application ${id}`}
      />
      <div className="card">
        <p className="placeholder-text">
          EMI schedule table with progress bar will load from loan EMI data.
        </p>
        <code>GET /api/loan-applications/{id}/schedule</code>
        <p className="back-link">
          <Link to="/loans/applied">← Back to my loans</Link>
        </p>
      </div>
    </div>
  );
}

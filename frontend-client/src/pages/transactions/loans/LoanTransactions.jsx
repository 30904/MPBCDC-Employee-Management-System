import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function LoanTransactions() {
  return (
    <div>
      <PageHeader title="Loan Transactions" subtitle="Applications and approval workflow" />
      <div className="card-grid">
        <Link className="card nav-card" to="/transactions/loans/applications">
          <h3>Loan Applications</h3>
          <p>Review submitted loan applications.</p>
        </Link>
        <Link className="card nav-card" to="/transactions/loans/approval-queue">
          <h3>Loan Approval Queue</h3>
          <p>Process pending loan approvals.</p>
        </Link>
        <Link className="card nav-card" to="/transactions/loans/disbursement">
          <h3>Loan Disbursement</h3>
          <p>Track loan release actions.</p>
        </Link>
      </div>
    </div>
  );
}

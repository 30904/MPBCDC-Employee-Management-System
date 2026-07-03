import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function LeaveTransactions() {
  return (
    <div>
      <PageHeader title="Leave Transactions" subtitle="Applications and approval queue" />
      <div className="card-grid">
        <Link className="card nav-card" to="/transactions/leaves/applications">
          <h3>Leave Applications</h3>
          <p>Review submitted leave applications.</p>
        </Link>
        <Link className="card nav-card" to="/transactions/leaves/approval-queue">
          <h3>Leave Approval Queue</h3>
          <p>Process pending leave approvals.</p>
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function LeaveSetup() {
  return (
    <div>
      <PageHeader title="Leave Setup" subtitle="Leave master setup for the client portal" />
      <div className="card-grid">
        <Link className="card nav-card" to="/settings/leave/types">
          <h3>Leave Types</h3>
          <p>Define leave categories and limits.</p>
        </Link>
        <Link className="card nav-card" to="/settings/leave/holidays">
          <h3>Holiday Calendar</h3>
          <p>Maintain holiday dates and observances.</p>
        </Link>
        <Link className="card nav-card" to="/settings/leave/accrual">
          <h3>Leave Accrual</h3>
          <p>Set accrual rules and carry-forward policies.</p>
        </Link>
        <Link className="card nav-card" to="/settings/leave/workflow">
          <h3>Leave Workflow</h3>
          <p>Configure approval flow for leave requests.</p>
        </Link>
      </div>
    </div>
  );
}

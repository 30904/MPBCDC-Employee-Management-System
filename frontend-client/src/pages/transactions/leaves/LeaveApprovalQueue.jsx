import EmptyState from '../../../components/EmptyState.jsx';

const WORKFLOW_NOTE =
  'Queue for client admin approval. Submitted applications appear here after employee submission.';

export default function LeaveApprovalQueue() {
  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Approval Queue</h3>
          <p className="placeholder-text">{WORKFLOW_NOTE}</p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          title="No pending leave approvals"
          message="Queue entries will appear once leave application APIs are connected in transaction rows."
        />

        <ul className="endpoint-list">
          <li>
            <code>GET /api/leave-applications?status=Submitted</code>
          </li>
          <li>
            <code>POST /api/leave-approvals</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
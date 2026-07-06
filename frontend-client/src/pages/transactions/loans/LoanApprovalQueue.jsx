import { useCallback, useEffect, useState } from 'react';
import {
  fetchLoanApprovalQueue,
  recordLoanApprovalDecision,
} from '../../../api/loanApplicationsApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import { getUser } from '../../../utils/auth.js';

function formatCurrency(amount) {
  if (amount === undefined || amount === null) {
    return '—';
  }

  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function LoanApprovalQueue() {
  const user = getUser();
  const [queueData, setQueueData] = useState({ applications: [], queues: [], workflow: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchLoanApprovalQueue();
      setQueueData({
        applications: data.applications ?? [],
        queues: data.queues ?? [],
        workflow: data.workflow ?? [],
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load approval queue.'));
      setQueueData({ applications: [], queues: [], workflow: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  async function handleDecision(application, decision) {
    setActingOn(application._id);
    setActionError('');

    try {
      await recordLoanApprovalDecision(application._id, {
        decision,
        remarks: decision === 'Rejected' ? 'Rejected from approval queue' : '',
      });
      await loadQueue();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to record decision.'));
    } finally {
      setActingOn(null);
    }
  }

  const userRoles = user?.roles?.join(', ') ?? '—';

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Loan Approval Queue</h3>
          <p className="placeholder-text">
            Signed in as <strong>{user?.loginId}</strong> ({userRoles}). Approve only when it is
            your turn in the workflow.
          </p>
        </div>
      </div>

      {queueData.queues.length > 0 && (
        <div className="card workflow-queue-card">
          <h4>Your queue access</h4>
          <ul className="queue-access-list">
            {queueData.queues.map((queue) => (
              <li key={`${queue.level}-${queue.approverRole}`}>
                Level {queue.level} — {queue.approverRole} (SLA {queue.slaDays}d) — statuses:{' '}
                {queue.statuses.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading pending applications…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && queueData.applications.length === 0 && (
          <EmptyState
            title="No applications in your queue"
            message={
              user?.roles?.includes('HR_OFFICER') && !user?.roles?.includes('CLIENT_ADMIN')
                ? 'New employee submissions stay in Submitted status until a Reporting Manager approves them. After that, Manager-approved items appear in your queue.'
                : `Submitted applications appear here when they reach your approval level.${
                    user?.companyCode ? ` Organization: ${user.companyCode}.` : ''
                  }`
            }
          />
        )}

        {!loading && queueData.applications.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Employee</th>
                  <th>Loan type</th>
                  <th>Status</th>
                  <th>Next approver</th>
                  <th>Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {queueData.applications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <code>{application.applicationNo || application._id.slice(-6)}</code>
                    </td>
                    <td>
                      {application.employeeId?.employeeCode ||
                        application.employeeId?._id?.slice(-6) ||
                        '—'}
                    </td>
                    <td>
                      {application.loanTypeId?.name
                        ? `${application.loanTypeId.name} (${application.loanTypeId.code})`
                        : '—'}
                    </td>
                    <td>{application.status}</td>
                    <td>{application.nextApproverRole || '—'}</td>
                    <td>{formatCurrency(application.requestedAmount)}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="primary-btn btn-sm"
                        disabled={!application.canCurrentUserApprove || actingOn === application._id}
                        title={application.approvalBlockReason || 'Approve application'}
                        onClick={() => handleDecision(application, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="secondary-btn btn-sm"
                        disabled={!application.canCurrentUserApprove || actingOn === application._id}
                        title={application.approvalBlockReason || 'Reject application'}
                        onClick={() => handleDecision(application, 'Rejected')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && queueData.applications.some((item) => !item.canCurrentUserApprove) && (
          <p className="placeholder-text queue-hint">
            Disabled actions are waiting on an earlier approver (e.g. HR cannot act until Manager
            approves).
          </p>
        )}
      </div>
    </div>
  );
}

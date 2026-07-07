import { useCallback, useEffect, useState } from 'react';
import {
  fetchLoanApprovalQueue,
  recordLoanApprovalDecision,
} from '../../../api/loanApplicationsApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const PENDING_STATUSES = new Set(['Submitted', 'ManagerApproved', 'HRApproved']);

function formatCurrency(amount) {
  if (amount === undefined || amount === null) {
    return '—';
  }

  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatQueueStatus(status) {
  if (PENDING_STATUSES.has(status)) {
    return 'Pending approval';
  }

  return status;
}

export default function LoanApprovalQueue() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchLoanApprovalQueue();
      setApplications(data.applications ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load approval queue.'));
      setApplications([]);
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

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Loan Approval Queue</h3>
          <p className="placeholder-text">
            Review submitted employee loan applications. Admin approval moves each request to the
            disbursement stage.
          </p>
        </div>
      </div>

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading pending applications…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <EmptyState
            title="No pending applications"
            message="Submitted loan applications will appear here for admin review."
          />
        )}

        {!loading && applications.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Employee</th>
                  <th>Loan type</th>
                  <th>Submitted</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
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
                    <td>{formatDate(application.submittedAt || application.createdAt)}</td>
                    <td>{formatCurrency(application.requestedAmount)}</td>
                    <td>{formatQueueStatus(application.status)}</td>
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
      </div>
    </div>
  );
}

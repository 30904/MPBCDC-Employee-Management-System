import { useCallback, useEffect, useState } from 'react';
import {
  fetchLeaveApprovalQueue,
  recordLeaveApprovalDecision,
} from '../../../api/leaveApplicationsApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import { formatDisplayDate } from '../../../utils/dateUtils.js';

const PENDING_STATUSES = new Set(['Submitted', 'ManagerApproved', 'HRApproved']);

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return formatDisplayDate(value) || '—';
}

function formatQueueStatus(status) {
  if (PENDING_STATUSES.has(status)) {
    return 'Pending approval';
  }

  return status;
}

export default function LeaveApprovalQueue() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchLeaveApprovalQueue();
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
      await recordLeaveApprovalDecision(application._id, {
        decision,
        remarks: decision === 'Rejected' ? 'Rejected from leave approval queue' : '',
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
          <h3>Leave Approval Queue</h3>
          <p className="placeholder-text">
            Review submitted employee leave applications. Admin action finalizes approval status.
          </p>
        </div>
      </div>

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading pending applications...</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <EmptyState
            title="No pending leave applications"
            message="Submitted leave applications will appear here for admin review."
          />
        )}

        {!loading && applications.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Employee</th>
                  <th>Leave type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
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
                    <td>{application.employeeId?.employeeCode || application.employeeId?._id?.slice(-6) || '—'}</td>
                    <td>
                      {application.leaveTypeId?.name
                        ? `${application.leaveTypeId.name} (${application.leaveTypeId.code})`
                        : '—'}
                    </td>
                    <td>{formatDate(application.fromDate)}</td>
                    <td>{formatDate(application.toDate)}</td>
                    <td>
                      {(application.workingDays ?? 0) + (application.sandwichDaysApplied ?? 0)}
                      {application.sandwichDaysApplied > 0
                        ? ` (${application.workingDays ?? 0}+${application.sandwichDaysApplied})`
                        : ''}
                    </td>
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
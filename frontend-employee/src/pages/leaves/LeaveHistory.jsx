import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchMyLeaveHistory, submitLeaveDraft } from '../../api/leaveApi.js';
import { getApiErrorMessage } from '../../api/response.js';
import { formatDisplayDate } from '../../utils/dateUtils.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

function leaveTypeLabel(application) {
  const leaveType = application.leaveTypeId;
  if (!leaveType || typeof leaveType !== 'object') {
    return '—';
  }

  return `${leaveType.name || '—'}${leaveType.code ? ` (${leaveType.code})` : ''}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return formatDisplayDate(value) || '—';
}

export default function LeaveHistory() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [submittingId, setSubmittingId] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchMyLeaveHistory({ limit: 50, status: statusFilter || undefined });
      setApplications(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load leave history.'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmitDraft(applicationId) {
    setSubmittingId(applicationId);
    setError('');

    try {
      await submitLeaveDraft(applicationId);
      await loadHistory();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit draft application.'));
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Leave History" subtitle="View your leave applications and status" />

      <div className="card">
        <div className="header-actions" style={{ marginBottom: 16 }}>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="placeholder-text">Loading your leave history...</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <p className="placeholder-text">You have not submitted any leave applications yet.</p>
        )}

        {!loading && applications.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <code>{application.applicationNo || application._id.slice(-6)}</code>
                    </td>
                    <td>{leaveTypeLabel(application)}</td>
                    <td>{formatDate(application.fromDate)}</td>
                    <td>{formatDate(application.toDate)}</td>
                    <td>
                      {(application.workingDays ?? 0) + (application.sandwichDaysApplied ?? 0)}
                      {application.sandwichDaysApplied > 0
                        ? ` (${application.workingDays ?? 0}+${application.sandwichDaysApplied} sandwich)`
                        : ''}
                    </td>
                    <td>{application.status}</td>
                    <td>{formatDate(application.submittedAt || application.createdAt)}</td>
                    <td>
                      {application.status === 'Draft' && (
                        <button
                          type="button"
                          className="primary-btn btn-sm"
                          disabled={submittingId === application._id}
                          onClick={() => handleSubmitDraft(application._id)}
                        >
                          {submittingId === application._id ? 'Submitting...' : 'Submit'}
                        </button>
                      )}
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

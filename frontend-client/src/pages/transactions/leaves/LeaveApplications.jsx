import { useCallback, useEffect, useState } from 'react';
import { fetchLeaveApplications } from '../../../api/leaveApplicationsApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

function employeeLabel(application) {
  const employee = application.employeeId;
  if (!employee || typeof employee !== 'object') {
    return '—';
  }

  return `${employee.employeeCode || '—'}${employee.employeeName ? ` - ${employee.employeeName}` : ''}`;
}

function leaveTypeLabel(application) {
  const leaveType = application.leaveTypeId;
  if (!leaveType || typeof leaveType !== 'object') {
    return '—';
  }

  return `${leaveType.code || '—'}${leaveType.name ? ` - ${leaveType.name}` : ''}`;
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

export default function LeaveApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchLeaveApplications({
        limit: 100,
        status: statusFilter || undefined,
      });
      setApplications(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load leave applications.'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Applications</h3>
          <p className="placeholder-text">Employee leave requests with workflow status tracking.</p>
        </div>
        <div className="header-actions">
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
      </div>

      <div className="card">
        {loading && <p className="placeholder-text">Loading applications...</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <EmptyState title="No leave applications" message="No applications found for this organization." />
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
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <code>{application.applicationNo || application._id.slice(-6)}</code>
                    </td>
                    <td>{employeeLabel(application)}</td>
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

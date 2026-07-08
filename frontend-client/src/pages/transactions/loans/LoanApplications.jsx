import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { fetchLoanApplications } from '../../../api/loanApplicationsApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import { getUser } from '../../../utils/auth.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'ManagerApproved', label: 'Manager approved' },
  { value: 'HRApproved', label: 'HR approved' },
  { value: 'FinanceApproved', label: 'Finance approved' },
  { value: 'Disbursed', label: 'Disbursed' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Rejected', label: 'Rejected' },
];

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

function employeeLabel(application) {
  const employee = application.employeeId;
  if (!employee || typeof employee !== 'object') {
    return '—';
  }

  return employee.employeeCode || employee._id?.slice(-6) || '—';
}

function loanTypeLabel(application) {
  const loanType = application.loanTypeId;
  if (!loanType || typeof loanType !== 'object') {
    return '—';
  }

  return `${loanType.name} (${loanType.code})`;
}

export default function LoanApplications() {
  const user = getUser();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchLoanApplications({
        limit: 100,
        status: statusFilter || undefined,
      });
      setApplications(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load loan applications.'));
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
          <h3>Loan Applications</h3>
          <p className="placeholder-text">
            Incoming employee loan requests and status tracking across the workflow.
          </p>
        </div>
        <div className="header-actions">
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
        {loading && <p className="placeholder-text">Loading applications…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <EmptyState
            title="No loan applications"
            message={`No applications for this organization yet. Employees must submit loans from the ESS portal under the same company code as your client login.${
              user?.companyCode ? ` Current org: ${user.companyCode}.` : ''
            }`}
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
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>EMI</th>
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
                    <td>{employeeLabel(application)}</td>
                    <td>{loanTypeLabel(application)}</td>
                    <td>{formatCurrency(application.requestedAmount)}</td>
                    <td>{application.requestedTenureMonths} mo</td>
                    <td>{formatCurrency(application.monthlyEmi)}</td>
                    <td>{application.status}</td>
                    <td>{formatDate(application.submittedAt || application.createdAt)}</td>
                    <td className="table-actions">
                      <Link to={`/transactions/loans/applications/${application._id}`}>View</Link>
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

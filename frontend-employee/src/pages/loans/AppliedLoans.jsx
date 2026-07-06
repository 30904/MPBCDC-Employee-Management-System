import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchMyLoanApplications } from '../../api/loansApi.js';
import { getApiErrorMessage } from '../../api/response.js';

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

function loanTypeLabel(application) {
  const loanType = application.loanTypeId;
  if (!loanType || typeof loanType !== 'object') {
    return '—';
  }

  return `${loanType.name} (${loanType.code})`;
}

export default function AppliedLoans() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchMyLoanApplications({ limit: 50 });
      setApplications(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load your loan applications.'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div>
      <PageHeader
        title="My Loans"
        subtitle="Track loan applications and their approval status"
        action={
          <Link to="/loans/apply" className="primary-btn">
            Apply for loan
          </Link>
        }
      />

      <div className="card">
        {loading && <p className="placeholder-text">Loading your applications…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <p className="placeholder-text">
            You have not submitted any loan applications yet.{' '}
            <Link to="/loans/apply">Apply for a loan</Link>
          </p>
        )}

        {!loading && applications.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
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
                    <td>{loanTypeLabel(application)}</td>
                    <td>{formatCurrency(application.requestedAmount)}</td>
                    <td>{application.requestedTenureMonths} mo</td>
                    <td>{formatCurrency(application.monthlyEmi)}</td>
                    <td>{application.status}</td>
                    <td>{formatDate(application.submittedAt || application.createdAt)}</td>
                    <td>
                      {application.status === 'Disbursed' && (
                        <Link to={`/loans/${application._id}/schedule`} className="secondary-btn btn-sm">
                          EMI schedule
                        </Link>
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

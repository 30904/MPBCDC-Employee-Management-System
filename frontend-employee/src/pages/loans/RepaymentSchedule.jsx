import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchLoanRepaymentSchedule } from '../../api/loansApi.js';
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

export default function RepaymentSchedule() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchLoanRepaymentSchedule(id);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to load EMI schedule.'));
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const schedule = data?.schedule ?? [];
  const paidCount = schedule.filter((row) => row.status === 'Paid').length;
  const progress = schedule.length > 0 ? Math.round((paidCount / schedule.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="EMI Repayment Schedule"
        subtitle={data?.application?.applicationNo ? `Loan ${data.application.applicationNo}` : `Application ${id}`}
      />

      <div className="card">
        {loading && <p className="placeholder-text">Loading EMI schedule…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && !data?.disbursement && (
          <p className="placeholder-text">
            This loan has not been disbursed yet. The schedule appears after finance disbursement.
          </p>
        )}

        {!loading && data?.disbursement && (
          <>
            <div className="loan-type-summary">
              <p>
                <strong>Disbursed amount:</strong>{' '}
                {formatCurrency(data.disbursement.disbursedAmount)}
              </p>
              <p>
                <strong>Monthly EMI:</strong> {formatCurrency(data.disbursement.monthlyEmi)}
              </p>
              <p>
                <strong>First EMI due:</strong> {formatDate(data.disbursement.firstEmiDate)}
              </p>
              <p>
                <strong>Repayment progress:</strong> {paidCount}/{schedule.length} EMIs ({progress}%)
              </p>
            </div>

            <div className="progress-bar" aria-hidden="true">
              <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
            </div>

            {schedule.length > 0 && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Due date</th>
                      <th>EMI</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row._id || row.emiNo}>
                        <td>{row.emiNo}</td>
                        <td>{formatDate(row.dueDate)}</td>
                        <td>{formatCurrency(row.emiAmount)}</td>
                        <td>{formatCurrency(row.principalComponent)}</td>
                        <td>{formatCurrency(row.interestComponent)}</td>
                        <td>{formatCurrency(row.outstandingBalance)}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <p className="back-link">
          <Link to="/loans/applied">← Back to my loans</Link>
        </p>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import {
  disburseLoanApplication,
  fetchDisbursements,
  fetchPendingDisbursements,
} from '../../../api/loanDisbursementsApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';

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

export default function LoanDisbursement() {
  const [pending, setPending] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [pendingData, disbursedData] = await Promise.all([
        fetchPendingDisbursements(),
        fetchDisbursements({ limit: 50 }),
      ]);

      setPending(pendingData.applications ?? []);
      setDisbursements(disbursedData.items ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load disbursement data.'));
      setPending([]);
      setDisbursements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDisburse(application) {
    setActingOn(application._id);
    setActionError('');

    try {
      await disburseLoanApplication({ applicationId: application._id });
      await loadData();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to disburse loan.'));
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Disbursement</h3>
          <p className="placeholder-text">
            Disburse finance-approved loans and generate EMI schedules automatically.
          </p>
        </div>
      </div>

      <div className="card workflow-queue-card">
        <h4>Ready to disburse</h4>
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading pending disbursements…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && pending.length === 0 && (
          <EmptyState
            title="No finance-approved loans"
            message="Applications appear here after the full approval workflow completes (Finance approved)."
          />
        )}

        {!loading && pending.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>EMI</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {pending.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <code>{application.applicationNo || application._id.slice(-6)}</code>
                    </td>
                    <td>{employeeLabel(application)}</td>
                    <td>{formatCurrency(application.requestedAmount)}</td>
                    <td>{application.requestedTenureMonths} mo</td>
                    <td>{formatCurrency(application.monthlyEmi)}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="primary-btn btn-sm"
                        disabled={actingOn === application._id}
                        onClick={() => handleDisburse(application)}
                      >
                        {actingOn === application._id ? 'Disbursing…' : 'Disburse'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h4>Disbursed loans</h4>
        {!loading && disbursements.length === 0 && (
          <p className="placeholder-text">No disbursements recorded yet.</p>
        )}

        {!loading && disbursements.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Disbursement</th>
                  <th>Loan no.</th>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>EMI</th>
                  <th>Disbursed on</th>
                </tr>
              </thead>
              <tbody>
                {disbursements.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <code>{item.disbursementNo}</code>
                    </td>
                    <td>{item.loanNo}</td>
                    <td>{item.employeeId?.employeeCode || '—'}</td>
                    <td>{formatCurrency(item.disbursedAmount)}</td>
                    <td>{formatCurrency(item.monthlyEmi)}</td>
                    <td>{formatDate(item.disbursedAt)}</td>
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

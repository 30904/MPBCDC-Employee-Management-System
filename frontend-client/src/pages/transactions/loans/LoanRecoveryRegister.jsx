import { useCallback, useEffect, useState } from 'react';
import {
  fetchPendingRecoveries,
  fetchRecoveries,
  recordLoanRecovery,
} from '../../../api/loanRecoveriesApi.js';
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

function currentPayrollMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function employeeLabel(item) {
  const employee = item.employeeId;
  if (!employee || typeof employee !== 'object') {
    return '—';
  }

  return employee.employeeCode || employee._id?.slice(-6) || '—';
}

export default function LoanRecoveryRegister() {
  const [payrollMonth, setPayrollMonth] = useState(currentPayrollMonth());
  const [pending, setPending] = useState([]);
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [pendingData, recoveryData] = await Promise.all([
        fetchPendingRecoveries(payrollMonth),
        fetchRecoveries({ payrollMonth, limit: 100 }),
      ]);

      setPending(pendingData.items ?? []);
      setRecoveries(recoveryData.items ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load loan recovery data.'));
      setPending([]);
      setRecoveries([]);
    } finally {
      setLoading(false);
    }
  }, [payrollMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRecordRecovery(item) {
    const key = `${item.loanNo}-${item.emiNo}`;
    setActingOn(key);
    setActionError('');

    try {
      await recordLoanRecovery({
        loanNo: item.loanNo,
        payrollMonth,
        emiNo: item.emiNo,
      });
      await loadData();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to record recovery.'));
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Loan Recovery Register</h3>
          <p className="placeholder-text">
            Mark payroll EMI deductions for disbursed loans and update repayment schedules.
          </p>
        </div>
        <div className="header-actions">
          <label>
            Payroll month
            <input
              type="month"
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="card workflow-queue-card">
        <h4>Due for deduction — {payrollMonth}</h4>
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading pending recoveries…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && pending.length === 0 && (
          <EmptyState
            title="No EMIs due this month"
            message="Pending EMI rows for active loans in the selected payroll month appear here for deduction."
          />
        )}

        {!loading && pending.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan no.</th>
                  <th>Employee</th>
                  <th>EMI #</th>
                  <th>Due date</th>
                  <th>EMI amount</th>
                  <th>Balance after</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => {
                  const rowKey = `${item.loanNo}-${item.emiNo}`;
                  return (
                    <tr key={rowKey}>
                      <td>
                        <code>{item.loanNo}</code>
                      </td>
                      <td>{employeeLabel(item)}</td>
                      <td>{item.emiNo}</td>
                      <td>{formatDate(item.dueDate)}</td>
                      <td>{formatCurrency(item.emiAmount)}</td>
                      <td>{formatCurrency(item.outstandingBalance)}</td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="primary-btn btn-sm"
                          disabled={actingOn === rowKey}
                          onClick={() => handleRecordRecovery(item)}
                        >
                          {actingOn === rowKey ? 'Recording…' : 'Mark deducted'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h4>Recorded recoveries — {payrollMonth}</h4>
        {!loading && recoveries.length === 0 && (
          <p className="placeholder-text">No recoveries recorded for this payroll month yet.</p>
        )}

        {!loading && recoveries.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan no.</th>
                  <th>Employee</th>
                  <th>EMI #</th>
                  <th>Amount</th>
                  <th>Balance outstanding</th>
                  <th>Status</th>
                  <th>Recovery date</th>
                </tr>
              </thead>
              <tbody>
                {recoveries.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <code>{item.loanNo}</code>
                    </td>
                    <td>{employeeLabel(item)}</td>
                    <td>{item.emiNo ?? '—'}</td>
                    <td>{formatCurrency(item.emiAmount)}</td>
                    <td>{formatCurrency(item.balanceOutstanding)}</td>
                    <td>{item.status}</td>
                    <td>{formatDate(item.recoveryDate)}</td>
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

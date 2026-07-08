import { useCallback, useEffect, useState } from 'react';
import { fetchLeaveBalances } from '../../../api/leaveBalancesApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';

function employeeLabel(balance) {
  const employee = balance.employeeId;
  if (!employee || typeof employee !== 'object') {
    return '—';
  }

  return `${employee.employeeCode || '—'}${employee.employeeName ? ` - ${employee.employeeName}` : ''}`;
}

function leaveTypeLabel(balance) {
  const leaveType = balance.leaveTypeId;
  if (!leaveType || typeof leaveType !== 'object') {
    return '—';
  }

  return `${leaveType.code || '—'}${leaveType.name ? ` - ${leaveType.name}` : ''}`;
}

function numberValue(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '0.00';
  }

  return Number(value).toFixed(2);
}

export default function LeaveBalances() {
  const [balances, setBalances] = useState([]);
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBalances = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchLeaveBalances({
        limit: 100,
        period: period || undefined,
      });
      setBalances(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load leave balances.'));
      setBalances([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Balances</h3>
          <p className="placeholder-text">Tenant-wide leave balance ledger by employee, type, and period.</p>
        </div>
        <div className="header-actions">
          <label>
            Period
            <input
              type="text"
              placeholder="e.g. 2026"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="card">
        {loading && <p className="placeholder-text">Loading balances...</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && balances.length === 0 && (
          <EmptyState
            title="No leave balances"
            message="No leave balance ledger entries were found for this tenant and filter."
          />
        )}

        {!loading && balances.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave type</th>
                  <th>Period</th>
                  <th>Opening</th>
                  <th>Accrued</th>
                  <th>Availed</th>
                  <th>Adjustment</th>
                  <th>Closing</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance) => (
                  <tr key={balance._id}>
                    <td>{employeeLabel(balance)}</td>
                    <td>{leaveTypeLabel(balance)}</td>
                    <td>{balance.period || '—'}</td>
                    <td>{numberValue(balance.openingBalance)}</td>
                    <td>{numberValue(balance.accrued)}</td>
                    <td>{numberValue(balance.availed)}</td>
                    <td>{numberValue(balance.adjustment)}</td>
                    <td>{numberValue(balance.closingBalance)}</td>
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

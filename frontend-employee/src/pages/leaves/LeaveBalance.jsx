import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchMyLeaveBalances } from '../../api/leaveApi.js';
import { getApiErrorMessage } from '../../api/response.js';

function leaveTypeLabel(balance) {
  const leaveType = balance.leaveTypeId;
  if (!leaveType || typeof leaveType !== 'object') {
    return '—';
  }

  return `${leaveType.name || '—'}${leaveType.code ? ` (${leaveType.code})` : ''}`;
}

function numberValue(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '0.00';
  }

  return Number(value).toFixed(2);
}

export default function LeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBalances = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchMyLeaveBalances({ limit: 50, period: period || undefined });
      setBalances(items);
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to load your leave balances.');
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
      <PageHeader title="Leave Balance" subtitle="Current leave balances by type and period" />

      <div className="card">
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <label>
            Period
            <input
              type="text"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              placeholder="e.g. 2026"
            />
          </label>
        </div>

        {loading && <p className="placeholder-text">Loading your leave balances...</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && balances.length === 0 && (
          <p className="placeholder-text">No leave balance entries found for the selected period.</p>
        )}

        {!loading && balances.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
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

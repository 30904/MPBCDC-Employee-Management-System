import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchDisbursements,
  fetchLoanSchedule,
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

function employeeLabel(disbursement) {
  const employee = disbursement.employeeId;
  if (!employee || typeof employee !== 'object') {
    return '—';
  }

  return employee.employeeCode || employee._id?.slice(-6) || '—';
}

function loanOptionLabel(disbursement) {
  const employee = employeeLabel(disbursement);
  return `${disbursement.loanNo} — ${employee}`;
}

export default function EmiScheduleView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [disbursements, setDisbursements] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const selectedApplicationId = searchParams.get('applicationId') || '';

  const selectedDisbursement = useMemo(
    () =>
      disbursements.find(
        (item) => String(item.applicationId?._id ?? item.applicationId) === selectedApplicationId
      ),
    [disbursements, selectedApplicationId]
  );

  const loadDisbursements = useCallback(async () => {
    setListLoading(true);
    setListError('');

    try {
      const result = await fetchDisbursements({ limit: 100 });
      setDisbursements(result.items ?? []);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Failed to load disbursed loans.'));
      setDisbursements([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisbursements();
  }, [loadDisbursements]);

  useEffect(() => {
    if (!selectedApplicationId) {
      setScheduleData(null);
      setScheduleError('');
      return undefined;
    }

    let cancelled = false;

    async function loadSchedule() {
      setScheduleLoading(true);
      setScheduleError('');

      try {
        const result = await fetchLoanSchedule(selectedApplicationId);
        if (!cancelled) {
          setScheduleData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setScheduleError(getApiErrorMessage(err, 'Failed to load EMI schedule.'));
          setScheduleData(null);
        }
      } finally {
        if (!cancelled) {
          setScheduleLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [selectedApplicationId]);

  function handleLoanChange(event) {
    const applicationId = event.target.value;
    if (applicationId) {
      setSearchParams({ applicationId });
    } else {
      setSearchParams({});
    }
  }

  const schedule = scheduleData?.schedule ?? [];
  const paidCount = schedule.filter((row) => row.status === 'Paid').length;
  const progress = schedule.length > 0 ? Math.round((paidCount / schedule.length) * 100) : 0;

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>EMI Schedule</h3>
          <p className="placeholder-text">
            View repayment schedules for disbursed loans, including principal, interest, and
            deduction status.
          </p>
        </div>
        <div className="header-actions">
          <label>
            Select loan
            <select
              value={selectedApplicationId}
              onChange={handleLoanChange}
              disabled={listLoading || disbursements.length === 0}
            >
              <option value="">Choose a disbursed loan…</option>
              {disbursements.map((item) => {
                const applicationId = String(item.applicationId?._id ?? item.applicationId);
                return (
                  <option key={item._id} value={applicationId}>
                    {loanOptionLabel(item)}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
      </div>

      {listError && <div className="form-error">{listError}</div>}

      {!listLoading && !listError && disbursements.length === 0 && (
        <EmptyState
          title="No disbursed loans"
          message="EMI schedules appear here after loans are disbursed from the Disbursement tab."
        />
      )}

      {!selectedApplicationId && disbursements.length > 0 && (
        <div className="card">
          <p className="placeholder-text">Select a loan above to view its EMI schedule.</p>
        </div>
      )}

      {selectedApplicationId && (
        <div className="card">
          {scheduleLoading && <p className="placeholder-text">Loading EMI schedule…</p>}
          {scheduleError && <div className="form-error">{scheduleError}</div>}

          {!scheduleLoading && !scheduleError && !scheduleData?.disbursement && (
            <p className="placeholder-text">
              No disbursement record found for this loan. The schedule is generated at disbursement
              time.
            </p>
          )}

          {!scheduleLoading && scheduleData?.disbursement && (
            <>
              <div className="loan-schedule-summary">
                <p>
                  <strong>Loan no.:</strong>{' '}
                  <code>{scheduleData.disbursement.loanNo}</code>
                </p>
                <p>
                  <strong>Employee:</strong>{' '}
                  {employeeLabel(selectedDisbursement || scheduleData.disbursement)}
                </p>
                <p>
                  <strong>Disbursed amount:</strong>{' '}
                  {formatCurrency(scheduleData.disbursement.disbursedAmount)}
                </p>
                <p>
                  <strong>Monthly EMI:</strong>{' '}
                  {formatCurrency(scheduleData.disbursement.monthlyEmi)}
                </p>
                <p>
                  <strong>Tenure:</strong> {scheduleData.disbursement.tenureMonths} months
                </p>
                <p>
                  <strong>Interest rate:</strong> {scheduleData.disbursement.interestRate ?? 0}%
                </p>
                <p>
                  <strong>First EMI due:</strong>{' '}
                  {formatDate(scheduleData.disbursement.firstEmiDate)}
                </p>
                <p>
                  <strong>Repayment progress:</strong> {paidCount}/{schedule.length} EMIs (
                  {progress}%)
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
                          <td>
                            <span
                              className={`status-badge ${
                                row.status === 'Paid'
                                  ? 'status-badge--active'
                                  : 'status-badge--inactive'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

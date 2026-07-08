import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import {
  fetchLoanRepaymentSchedule,
  updateLoanRepaymentScheduleEmi,
} from '../../api/loansApi.js';
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

function formatInterestFormula(value) {
  if (value === 'SIMPLE_INTEREST') {
    return 'Simple Interest';
  }

  if (value === 'COMPOUND_INTEREST') {
    return 'Compound Interest';
  }

  return value || '—';
}

export default function RepaymentSchedule() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [editingEmiNo, setEditingEmiNo] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await fetchLoanRepaymentSchedule(id);
      setData(result);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load EMI schedule.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  function startEdit(row) {
    setEditingEmiNo(row.emiNo);
    setEditAmount(String(row.emiAmount ?? ''));
    setActionError('');
  }

  function cancelEdit() {
    setEditingEmiNo(null);
    setEditAmount('');
    setActionError('');
  }

  async function saveEdit(emiNo) {
    const emiAmount = Number(editAmount);

    if (!Number.isFinite(emiAmount) || emiAmount < 0) {
      setActionError('Enter a valid EMI amount that is zero or greater.');
      return;
    }

    setSaving(true);
    setActionError('');

    try {
      const result = await updateLoanRepaymentScheduleEmi(id, emiNo, emiAmount);
      setData(result);
      cancelEdit();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update EMI schedule.'));
    } finally {
      setSaving(false);
    }
  }

  const schedule = data?.schedule ?? [];
  const paidCount = schedule.filter((row) => row.status === 'Paid').length;
  const progress = schedule.length > 0 ? Math.round((paidCount / schedule.length) * 100) : 0;
  const totals = schedule.reduce(
    (acc, row) => ({
      emiAmount: acc.emiAmount + (Number(row.emiAmount) || 0),
      principalComponent: acc.principalComponent + (Number(row.principalComponent) || 0),
      interestComponent: acc.interestComponent + (Number(row.interestComponent) || 0),
      outstandingBalance: acc.outstandingBalance + (Number(row.outstandingBalance) || 0),
    }),
    { emiAmount: 0, principalComponent: 0, interestComponent: 0, outstandingBalance: 0 }
  );
  const interestFormula =
    data?.disbursement?.interestFormula ||
    data?.application?.eligibilitySnapshot?.derived?.interestFormula;

  return (
    <div>
      <PageHeader
        title="EMI Repayment Schedule"
        subtitle={data?.application?.applicationNo ? `Loan ${data.application.applicationNo}` : `Application ${id}`}
      />

      <div className="card">
        {loading && <p className="placeholder-text">Loading EMI schedule…</p>}
        {error && <div className="form-error">{error}</div>}
        {actionError && <div className="form-error">{actionError}</div>}

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
                <strong>Interest formula:</strong> {formatInterestFormula(interestFormula)}
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

            <p className="placeholder-text">
              Pending EMIs can be edited. Changing one month&apos;s EMI recalculates principal,
              interest, and balances for that month and all following months.
            </p>

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
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row._id || row.emiNo}>
                        <td>{row.emiNo}</td>
                        <td>{formatDate(row.dueDate)}</td>
                        <td>
                          {editingEmiNo === row.emiNo ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="emi-edit-input"
                            />
                          ) : (
                            <>
                              {formatCurrency(row.emiAmount)}
                              {row.isManuallyAdjusted ? ' *' : ''}
                            </>
                          )}
                        </td>
                        <td>{formatCurrency(row.principalComponent)}</td>
                        <td>{formatCurrency(row.interestComponent)}</td>
                        <td>{formatCurrency(row.outstandingBalance)}</td>
                        <td>{row.status}</td>
                        <td className="table-actions">
                          {row.status === 'Pending' && editingEmiNo !== row.emiNo && (
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => startEdit(row)}
                            >
                              Edit
                            </button>
                          )}
                          {editingEmiNo === row.emiNo && (
                            <>
                              <button
                                type="button"
                                className="primary-btn btn-sm"
                                disabled={saving}
                                onClick={() => saveEdit(row.emiNo)}
                              >
                                {saving ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                className="secondary-btn btn-sm"
                                disabled={saving}
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="2">Total</th>
                      <th>{formatCurrency(totals.emiAmount)}</th>
                      <th>{formatCurrency(totals.principalComponent)}</th>
                      <th>{formatCurrency(totals.interestComponent)}</th>
                      <th>{formatCurrency(totals.outstandingBalance)}</th>
                      <th>—</th>
                      <th>—</th>
                    </tr>
                  </tfoot>
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

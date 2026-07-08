import { useCallback, useEffect, useState } from 'react';
import {
  createAccrualRule,
  deleteAccrualRule,
  fetchAccrualRules,
  fetchLeaveTypeOptionsForAccrual,
  runLeaveAccrual,
  updateAccrualRule,
} from '../../../api/leaveAccrualRulesApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import LeaveAccrualRuleForm from './LeaveAccrualRuleForm.jsx';

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

function monthSummary(rule) {
  if (rule.accrualFrequency === 'MONTHLY') {
    return 'Every month';
  }

  if (rule.scheduledMonthLabels?.length) {
    return rule.scheduledMonthLabels.join(', ');
  }

  return (rule.scheduledMonths || []).join(', ') || '—';
}

function defaultPeriodKey(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month <= 6 ? `${year}-H1` : `${year}-H2`;
}

export default function LeaveAccrualSetup() {
  const [rules, setRules] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');
  const [runPeriod, setRunPeriod] = useState(defaultPeriodKey());
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState('');

  const loadLeaveTypeOptions = useCallback(async () => {
    try {
      const options = await fetchLeaveTypeOptionsForAccrual();
      setLeaveTypeOptions(options);
    } catch {
      setLeaveTypeOptions([]);
    }
  }, []);

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchAccrualRules({ limit: 100 });
      setRules(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load accrual rules.'));
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaveTypeOptions();
  }, [loadLeaveTypeOptions]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setActionError('');
  }

  function openCreateForm() {
    setEditing(null);
    setShowForm(true);
    setActionError('');
  }

  function openEditForm(rule) {
    setEditing(rule);
    setShowForm(true);
    setActionError('');
  }

  async function handleCreate(payload) {
    await createAccrualRule(payload);
    closeForm();
    await loadRules();
  }

  async function handleUpdate(payload) {
    await updateAccrualRule(editing._id, payload);
    closeForm();
    await loadRules();
  }

  async function handleToggleStatus(rule) {
    setActionError('');

    try {
      const nextStatus = rule.status === 'Active' ? 'Inactive' : 'Active';
      await updateAccrualRule(rule._id, { status: nextStatus });
      await loadRules();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update accrual rule status.'));
    }
  }

  async function handleDelete(rule) {
    const confirmed = window.confirm(`Delete accrual rule "${rule.ruleCode}"?`);

    if (!confirmed) {
      return;
    }

    setActionError('');

    try {
      await deleteAccrualRule(rule._id);
      if (editing?._id === rule._id) {
        closeForm();
      }
      await loadRules();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete accrual rule.'));
    }
  }

  async function handleRunAccrual() {
    setRunning(true);
    setRunError('');
    setRunResult(null);

    try {
      const result = await runLeaveAccrual({
        period: runPeriod.trim() || undefined,
        asOfDate: new Date().toISOString().slice(0, 10),
      });
      setRunResult(result);
    } catch (err) {
      setRunError(getApiErrorMessage(err, 'Failed to run leave accrual.'));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Accrual Rules</h3>
          <p className="placeholder-text">
            Configure half-yearly EL credits (Jan 1 & Jul 1), pro-rata for new joiners, and accrual schedules.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="primary-btn" onClick={openCreateForm}>
            + New Accrual Rule
          </button>
        )}
      </div>

      {showForm && (
        <LeaveAccrualRuleForm
          initialValues={editing}
          leaveTypeOptions={leaveTypeOptions}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeForm}
          submitLabel={editing ? 'Update Accrual Rule' : 'Create Accrual Rule'}
        />
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-header">
          <div>
            <h3>Run Accrual</h3>
            <p className="placeholder-text">
              Post leave credits to employee balance ledger for a period (idempotent — re-run skips already posted rows).
            </p>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: 12 }}>
          <label>
            Period key
            <input
              type="text"
              value={runPeriod}
              onChange={(event) => setRunPeriod(event.target.value)}
              placeholder="e.g. 2026-H1"
            />
          </label>
        </div>

        {runError && <div className="form-error">{runError}</div>}
        {runResult && (
          <div className="form-success">
            Posted period <code>{runResult.period}</code> — employees {runResult.employeesProcessed},
            updated {runResult.balancesUpdated}, skipped {runResult.balancesSkipped} (rules:{' '}
            {runResult.ruleCount}).
          </div>
        )}

        <button type="button" className="primary-btn" onClick={handleRunAccrual} disabled={running}>
          {running ? 'Running…' : 'Run Accrual Now'}
        </button>
      </div>

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading accrual rules…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && rules.length === 0 && (
          <EmptyState
            title="No accrual rules configured"
            message="Seed defaults with npm run seed:leave-accrual-rules or create EL half-yearly accrual manually."
            action={
              <button type="button" className="primary-btn" onClick={openCreateForm}>
                Create Accrual Rule
              </button>
            }
          />
        )}

        {!loading && rules.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Leave Type</th>
                  <th>Frequency</th>
                  <th>Days / Run</th>
                  <th>Months</th>
                  <th>Pro-rata</th>
                  <th>Effective</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule._id}>
                    <td>
                      <code>{rule.ruleCode}</code>
                    </td>
                    <td>{rule.leaveType?.code || '—'}</td>
                    <td>{rule.accrualFrequency}</td>
                    <td>{rule.accrualDays}</td>
                    <td>{monthSummary(rule)}</td>
                    <td>{rule.applyProRata ? 'Yes' : 'No'}</td>
                    <td>{formatDate(rule.effectiveDate)}</td>
                    <td>
                      <StatusBadge status={rule.status} />
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => openEditForm(rule)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => handleToggleStatus(rule)}
                      >
                        {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="link-btn link-btn--danger"
                        onClick={() => handleDelete(rule)}
                      >
                        Delete
                      </button>
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

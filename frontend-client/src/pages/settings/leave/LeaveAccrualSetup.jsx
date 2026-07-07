import { useCallback, useEffect, useState } from 'react';
import {
  createAccrualRule,
  deleteAccrualRule,
  fetchAccrualRules,
  fetchLeaveTypeOptionsForAccrual,
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

export default function LeaveAccrualSetup() {
  const [rules, setRules] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

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

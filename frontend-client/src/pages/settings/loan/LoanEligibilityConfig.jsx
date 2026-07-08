import { useCallback, useEffect, useState } from 'react';
import {
  createEligibilityRule,
  deleteEligibilityRule,
  fetchEligibilityRules,
  updateEligibilityRule,
} from '../../../api/loanEligibilityRulesApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import LoanEligibilityRuleForm from './LoanEligibilityRuleForm.jsx';

function formatInterestFormula(value) {
  if (value === 'SIMPLE_INTEREST') {
    return 'Simple Interest';
  }

  if (value === 'COMPOUND_INTEREST') {
    return 'Compound Interest';
  }

  return value || '—';
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

export default function LoanEligibilityConfig() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchEligibilityRules({ limit: 100 });
      setRules(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load eligibility rules.'));
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    await createEligibilityRule(payload);
    closeForm();
    await loadRules();
  }

  async function handleUpdate(payload) {
    await updateEligibilityRule(editing._id, payload);
    closeForm();
    await loadRules();
  }

  async function handleToggleStatus(rule) {
    setActionError('');

    try {
      const nextStatus = rule.status === 'Active' ? 'Inactive' : 'Active';
      await updateEligibilityRule(rule._id, { status: nextStatus });
      await loadRules();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update rule status.'));
    }
  }

  async function handleDelete(rule) {
    const confirmed = window.confirm(`Delete eligibility rule "${rule.ruleCode}"?`);
    if (!confirmed) {
      return;
    }

    setActionError('');

    try {
      await deleteEligibilityRule(rule._id);
      if (editing?._id === rule._id) {
        closeForm();
      }
      await loadRules();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete eligibility rule.'));
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Eligibility Rules</h3>
          <p className="placeholder-text">
            Configure loan amount %, tenure bounds, interest formula, EMI cap, and retirement buffer
            used when employees preview loan eligibility.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="primary-btn" onClick={openCreateForm}>
            + New Rule
          </button>
        )}
      </div>

      {showForm && (
        <LoanEligibilityRuleForm
          initialValues={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeForm}
          submitLabel={editing ? 'Update Rule' : 'Create Rule'}
        />
      )}

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading eligibility rules…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && rules.length === 0 && (
          <EmptyState
            title="No eligibility rules configured"
            message="Create a DEFAULT rule with 60% max EMI and 3-month retirement buffer."
            action={
              <button type="button" className="primary-btn" onClick={openCreateForm}>
                Create DEFAULT Rule
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
                  <th>Effective</th>
                  <th>Min Service</th>
                  <th>Amount %</th>
                  <th>Tenure</th>
                  <th>Formula</th>
                  <th>Max EMI %</th>
                  <th>Retirement Buffer</th>
                  <th>Salary Mult.</th>
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
                    <td>{formatDate(rule.effectiveDate)}</td>
                    <td>{rule.minServiceMonths} mo</td>
                    <td>
                      {rule.minAmountPercentOfSalary ?? '—'} – {rule.maxAmountPercentOfSalary ?? '—'}%
                    </td>
                    <td>
                      {rule.minTenureMonths ?? 1} – {rule.maxTenureMonths ?? 'type max'} mo
                    </td>
                    <td>{formatInterestFormula(rule.interestFormula)}</td>
                    <td>{rule.maxEmiPercentOfGross}%</td>
                    <td>{rule.retirementBufferMonths} mo</td>
                    <td>{rule.salaryMultiplier ?? '—'}</td>
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

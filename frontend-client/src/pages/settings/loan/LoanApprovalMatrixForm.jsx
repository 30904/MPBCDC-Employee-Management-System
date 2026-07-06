import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const APPROVER_ROLES = [
  { value: 'REPORTING_MANAGER', label: 'Reporting Manager (Level 1)' },
  { value: 'HR_OFFICER', label: 'HR Officer (Level 2)' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer (Level 3)' },
];

const EMPTY_FORM = {
  code: 'LOAN_DEFAULT',
  module: 'LOAN',
  level: '1',
  approverRole: 'REPORTING_MANAGER',
  slaDays: '3',
  isActive: true,
};

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM };
  }

  return {
    code: initialValues.code ?? 'LOAN_DEFAULT',
    module: initialValues.module ?? 'LOAN',
    level: String(initialValues.level ?? 1),
    approverRole: initialValues.approverRole ?? 'REPORTING_MANAGER',
    slaDays: String(initialValues.slaDays ?? 3),
    isActive: initialValues.isActive !== false,
  };
}

function buildPayload(form) {
  return {
    code: form.code.trim().toUpperCase(),
    module: form.module.trim().toUpperCase(),
    level: Number(form.level),
    approverRole: form.approverRole,
    slaDays: Number(form.slaDays),
    isActive: form.isActive,
  };
}

export default function LoanApprovalMatrixForm({
  initialValues = null,
  onSubmit,
  onCancel,
  submitLabel = 'Save Level',
}) {
  const [form, setForm] = useState(() => toFormValues(initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toFormValues(initialValues));
    setError('');
  }, [initialValues]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(buildPayload(form));
      if (!initialValues) {
        setForm({ ...EMPTY_FORM });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save approval level.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{initialValues ? 'Edit Approval Level' : 'Add Approval Level'}</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Workflow Code
          <input
            type="text"
            value={form.code}
            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
            required
            disabled={Boolean(initialValues)}
          />
        </label>
        <label>
          Level
          <input
            type="number"
            min="1"
            step="1"
            value={form.level}
            onChange={(e) => updateField('level', e.target.value)}
            required
            disabled={Boolean(initialValues)}
          />
        </label>
        <label>
          Approver Role
          <select
            value={form.approverRole}
            onChange={(e) => updateField('approverRole', e.target.value)}
          >
            {APPROVER_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          SLA (days)
          <input
            type="number"
            min="1"
            step="1"
            value={form.slaDays}
            onChange={(e) => updateField('slaDays', e.target.value)}
            required
          />
        </label>
        <label>
          Status
          <select
            value={form.isActive ? 'Active' : 'Inactive'}
            onChange={(e) => updateField('isActive', e.target.value === 'Active')}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

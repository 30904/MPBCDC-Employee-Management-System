import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import { ROLES } from '../../../constants/roles.js';

const EMPTY_FORM = {
  code: 'LEAVE_DEFAULT',
  module: 'LEAVE',
  level: '1',
  approverRole: ROLES.CLIENT_ADMIN,
  slaDays: '3',
  isActive: true,
};

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM };
  }

  return {
    code: initialValues.code ?? 'LEAVE_DEFAULT',
    module: initialValues.module ?? 'LEAVE',
    level: String(initialValues.level ?? 1),
    approverRole: ROLES.CLIENT_ADMIN,
    slaDays: String(initialValues.slaDays ?? 3),
    isActive: initialValues.isActive !== false,
  };
}

function buildPayload(form) {
  return {
    code: form.code.trim().toUpperCase(),
    module: form.module.trim().toUpperCase(),
    level: Number(form.level),
    approverRole: ROLES.CLIENT_ADMIN,
    slaDays: Number(form.slaDays),
    isActive: form.isActive,
  };
}

export default function LeaveApprovalMatrixForm({
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
          Approver
          <input type="text" value="Admin" readOnly />
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

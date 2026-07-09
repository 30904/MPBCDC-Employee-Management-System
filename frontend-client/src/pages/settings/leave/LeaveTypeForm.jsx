import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const FLAG_FIELDS = [
  { key: 'allowsHalfDay', label: 'Allow half-day leave' },
  { key: 'isEncashable', label: 'Encashable at year-end' },
  { key: 'allowsCarryForward', label: 'Allow carry-forward' },
  { key: 'applySandwichRule', label: 'Apply sandwich rule' },
  { key: 'hrApprovalRequired', label: 'HR approval required (legacy flag)' },
];

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
  annualEntitlement: '',
  allowsHalfDay: true,
  isEncashable: false,
  allowsCarryForward: false,
  maxCarryForwardDays: '0',
  maxAccumulation: '300',
  applySandwichRule: false,
  hrApprovalRequired: false,
  isActive: true,
};

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM };
  }

  return {
    code: initialValues.code ?? '',
    name: initialValues.name ?? '',
    description: initialValues.description ?? '',
    annualEntitlement:
      initialValues.annualEntitlement === undefined || initialValues.annualEntitlement === null
        ? ''
        : String(initialValues.annualEntitlement),
    allowsHalfDay: initialValues.allowsHalfDay !== false,
    isEncashable: Boolean(initialValues.isEncashable),
    allowsCarryForward: Boolean(initialValues.allowsCarryForward),
    maxCarryForwardDays:
      initialValues.maxCarryForwardDays === undefined || initialValues.maxCarryForwardDays === null
        ? '0'
        : String(initialValues.maxCarryForwardDays),
    maxAccumulation:
      initialValues.maxAccumulation === undefined || initialValues.maxAccumulation === null
        ? '300'
        : String(initialValues.maxAccumulation),
    applySandwichRule: Boolean(initialValues.applySandwichRule),
    hrApprovalRequired: Boolean(initialValues.hrApprovalRequired),
    isActive: initialValues.isActive !== false,
  };
}

function buildPayload(form) {
  const payload = {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    annualEntitlement: Number(form.annualEntitlement),
    allowsHalfDay: form.allowsHalfDay,
    isEncashable: form.isEncashable,
    allowsCarryForward: form.allowsCarryForward,
    maxCarryForwardDays: form.allowsCarryForward ? Number(form.maxCarryForwardDays || 0) : 0,
    maxAccumulation: Number(form.maxAccumulation || 0),
    applySandwichRule: form.applySandwichRule,
    hrApprovalRequired: form.hrApprovalRequired,
    isActive: form.isActive,
  };

  return payload;
}

export default function LeaveTypeForm({
  initialValues = null,
  onSubmit,
  onCancel,
  submitLabel = 'Save Leave Type',
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

  function toggleFlag(key) {
    setForm((current) => {
      const next = { ...current, [key]: !current[key] };

      if (key === 'allowsCarryForward' && !next.allowsCarryForward) {
        next.maxCarryForwardDays = '0';
      }

      return next;
    });
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
      setError(getApiErrorMessage(err, 'Failed to save leave type.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{initialValues ? 'Edit Leave Type' : 'New Leave Type'}</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Code
          <input
            type="text"
            value={form.code}
            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
            required
            maxLength={10}
            placeholder="e.g. CL"
            disabled={Boolean(initialValues)}
          />
        </label>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            placeholder="e.g. Casual Leave"
          />
        </label>
        <label>
          Annual Entitlement (days)
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.annualEntitlement}
            onChange={(e) => updateField('annualEntitlement', e.target.value)}
            required
            placeholder="12"
          />
        </label>
        <label>
          Max Accumulation (days)
          <input
            type="number"
            min="0"
            step="1"
            value={form.maxAccumulation}
            onChange={(e) => updateField('maxAccumulation', e.target.value)}
            placeholder="300"
          />
        </label>
        <label>
          Max Carry-Forward Days
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.maxCarryForwardDays}
            onChange={(e) => updateField('maxCarryForwardDays', e.target.value)}
            disabled={!form.allowsCarryForward}
            placeholder="15"
          />
        </label>
        <label className="form-grid-span-2">
          Description
          <input
            type="text"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Optional description"
          />
        </label>
      </div>

      <fieldset className="module-fieldset">
        <legend>Leave Rules</legend>
        {FLAG_FIELDS.map(({ key, label }) => (
          <label key={key} className="checkbox-label">
            <input type="checkbox" checked={form[key]} onChange={() => toggleFlag(key)} />
            {label}
          </label>
        ))}
      </fieldset>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => updateField('isActive', e.target.checked)}
        />
        Active (available for leave applications)
      </label>

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

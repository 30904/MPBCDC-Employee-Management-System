import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const FREQUENCY_OPTIONS = [
  { value: 'HALF_YEARLY', label: 'Half-yearly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const EMPTY_FORM = {
  ruleCode: '',
  leaveTypeId: '',
  name: '',
  description: '',
  accrualFrequency: 'HALF_YEARLY',
  accrualDays: '15',
  scheduledMonths: [1, 7],
  accumulationLimit: '300',
  applyProRata: true,
  effectiveDate: '',
  status: 'Active',
};

function toDateInputValue(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM, scheduledMonths: [...EMPTY_FORM.scheduledMonths] };
  }

  return {
    ruleCode: initialValues.ruleCode ?? '',
    leaveTypeId: initialValues.leaveType?._id || initialValues.leaveTypeId?._id || initialValues.leaveTypeId || '',
    name: initialValues.name ?? '',
    description: initialValues.description ?? '',
    accrualFrequency: initialValues.accrualFrequency ?? 'HALF_YEARLY',
    accrualDays:
      initialValues.accrualDays === undefined || initialValues.accrualDays === null
        ? ''
        : String(initialValues.accrualDays),
    scheduledMonths: Array.isArray(initialValues.scheduledMonths)
      ? [...initialValues.scheduledMonths]
      : [],
    accumulationLimit:
      initialValues.accumulationLimit === undefined || initialValues.accumulationLimit === null
        ? '300'
        : String(initialValues.accumulationLimit),
    applyProRata: initialValues.applyProRata !== false,
    effectiveDate: toDateInputValue(initialValues.effectiveDate),
    status: initialValues.status ?? 'Active',
  };
}

function buildPayload(form) {
  return {
    ruleCode: form.ruleCode.trim().toUpperCase(),
    leaveTypeId: form.leaveTypeId,
    name: form.name.trim(),
    description: form.description.trim(),
    accrualFrequency: form.accrualFrequency,
    accrualDays: Number(form.accrualDays),
    scheduledMonths: [...form.scheduledMonths].sort((a, b) => a - b),
    accumulationLimit: Number(form.accumulationLimit || 0),
    applyProRata: form.applyProRata,
    effectiveDate: form.effectiveDate,
    status: form.status,
  };
}

export default function LeaveAccrualRuleForm({
  initialValues = null,
  leaveTypeOptions = [],
  onSubmit,
  onCancel,
  submitLabel = 'Save Accrual Rule',
}) {
  const [form, setForm] = useState(() => toFormValues(initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toFormValues(initialValues));
    setError('');
  }, [initialValues]);

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === 'accrualFrequency') {
        if (value === 'HALF_YEARLY' && next.scheduledMonths.length === 0) {
          next.scheduledMonths = [1, 7];
        }
        if (value === 'YEARLY' && next.scheduledMonths.length === 0) {
          next.scheduledMonths = [1];
        }
        if (value === 'MONTHLY') {
          next.scheduledMonths = [];
        }
      }

      return next;
    });
  }

  function toggleMonth(month) {
    setForm((current) => {
      const selected = new Set(current.scheduledMonths);
      if (selected.has(month)) {
        selected.delete(month);
      } else {
        selected.add(month);
      }

      return {
        ...current,
        scheduledMonths: [...selected].sort((a, b) => a - b),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.leaveTypeId) {
      setError('Leave type is required.');
      return;
    }

    if (form.accrualFrequency !== 'MONTHLY' && form.scheduledMonths.length === 0) {
      setError('Select at least one scheduled month.');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(buildPayload(form));
      if (!initialValues) {
        setForm({ ...EMPTY_FORM, scheduledMonths: [1, 7] });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save accrual rule.'));
    } finally {
      setLoading(false);
    }
  }

  const showMonthPicker = form.accrualFrequency !== 'MONTHLY';

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{initialValues ? 'Edit Accrual Rule' : 'New Accrual Rule'}</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Rule Code
          <input
            type="text"
            value={form.ruleCode}
            onChange={(e) => updateField('ruleCode', e.target.value.toUpperCase())}
            required
            maxLength={30}
            placeholder="e.g. EL_HALF_YEARLY"
            disabled={Boolean(initialValues)}
          />
        </label>
        <label>
          Leave Type
          <select
            value={form.leaveTypeId}
            onChange={(e) => updateField('leaveTypeId', e.target.value)}
            required
          >
            <option value="">Select leave type</option>
            {leaveTypeOptions.map((leaveType) => (
              <option key={leaveType._id} value={leaveType._id}>
                {leaveType.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rule Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Earned Leave Half-Yearly Accrual"
          />
        </label>
        <label>
          Accrual Frequency
          <select
            value={form.accrualFrequency}
            onChange={(e) => updateField('accrualFrequency', e.target.value)}
            required
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Accrual Days (per run)
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.accrualDays}
            onChange={(e) => updateField('accrualDays', e.target.value)}
            required
            placeholder="15"
          />
        </label>
        <label>
          Accumulation Limit
          <input
            type="number"
            min="0"
            step="1"
            value={form.accumulationLimit}
            onChange={(e) => updateField('accumulationLimit', e.target.value)}
            placeholder="300"
          />
        </label>
        <label>
          Effective Date
          <input
            type="date"
            value={form.effectiveDate}
            onChange={(e) => updateField('effectiveDate', e.target.value)}
            required
          />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <label className="form-grid-span-2">
          Description
          <input
            type="text"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Optional notes"
          />
        </label>
      </div>

      {showMonthPicker && (
        <fieldset className="module-fieldset">
          <legend>Scheduled Months</legend>
          {MONTH_OPTIONS.map((month) => (
            <label key={month.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={form.scheduledMonths.includes(month.value)}
                onChange={() => toggleMonth(month.value)}
              />
              {month.label}
            </label>
          ))}
        </fieldset>
      )}

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={form.applyProRata}
          onChange={(e) => updateField('applyProRata', e.target.checked)}
        />
        Apply pro-rata for new joiners
      </label>

      <p className="placeholder-text">
        Half-yearly EL accrual typically credits 15 days on January 1 and July 1.
      </p>

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

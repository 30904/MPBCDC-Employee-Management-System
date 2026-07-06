import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const EMPTY_FORM = {
  ruleCode: 'DEFAULT',
  minServiceMonths: '0',
  salaryMultiplier: '',
  maxEmiPercentOfGross: '60',
  retirementBufferMonths: '3',
  effectiveDate: '',
  status: 'Active',
};

function toDateInputValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM };
  }

  return {
    ruleCode: initialValues.ruleCode ?? 'DEFAULT',
    minServiceMonths:
      initialValues.minServiceMonths === undefined || initialValues.minServiceMonths === null
        ? '0'
        : String(initialValues.minServiceMonths),
    salaryMultiplier:
      initialValues.salaryMultiplier === null || initialValues.salaryMultiplier === undefined
        ? ''
        : String(initialValues.salaryMultiplier),
    maxEmiPercentOfGross:
      initialValues.maxEmiPercentOfGross === undefined || initialValues.maxEmiPercentOfGross === null
        ? '60'
        : String(initialValues.maxEmiPercentOfGross),
    retirementBufferMonths:
      initialValues.retirementBufferMonths === undefined ||
      initialValues.retirementBufferMonths === null
        ? '3'
        : String(initialValues.retirementBufferMonths),
    effectiveDate: toDateInputValue(initialValues.effectiveDate),
    status: initialValues.status ?? 'Active',
  };
}

function buildPayload(form) {
  const payload = {
    ruleCode: form.ruleCode.trim().toUpperCase() || 'DEFAULT',
    minServiceMonths: Number(form.minServiceMonths || 0),
    maxEmiPercentOfGross: Number(form.maxEmiPercentOfGross || 60),
    retirementBufferMonths: Number(form.retirementBufferMonths || 3),
    effectiveDate: form.effectiveDate,
    status: form.status,
  };

  if (form.salaryMultiplier !== '') {
    payload.salaryMultiplier = Number(form.salaryMultiplier);
  }

  return payload;
}

export default function LoanEligibilityRuleForm({
  initialValues = null,
  onSubmit,
  onCancel,
  submitLabel = 'Save Rule',
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
      setError(getApiErrorMessage(err, 'Failed to save eligibility rule.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{initialValues ? 'Edit Eligibility Rule' : 'New Eligibility Rule'}</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Rule Code
          <input
            type="text"
            value={form.ruleCode}
            onChange={(e) => updateField('ruleCode', e.target.value.toUpperCase())}
            required
            maxLength={20}
            disabled={Boolean(initialValues)}
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
          Min Service (months)
          <input
            type="number"
            min="0"
            step="1"
            value={form.minServiceMonths}
            onChange={(e) => updateField('minServiceMonths', e.target.value)}
          />
        </label>
        <label>
          Salary Multiplier (optional)
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.salaryMultiplier}
            onChange={(e) => updateField('salaryMultiplier', e.target.value)}
            placeholder="e.g. 10"
          />
        </label>
        <label>
          Max EMI % of Gross
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.maxEmiPercentOfGross}
            onChange={(e) => updateField('maxEmiPercentOfGross', e.target.value)}
            required
          />
        </label>
        <label>
          Retirement Buffer (months)
          <input
            type="number"
            min="0"
            step="1"
            value={form.retirementBufferMonths}
            onChange={(e) => updateField('retirementBufferMonths', e.target.value)}
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
      </div>

      <p className="placeholder-text">
        Rules apply company-wide. EMI cap, 40% retain-after-EMI, and retirement buffer are enforced
        during employee eligibility preview.
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

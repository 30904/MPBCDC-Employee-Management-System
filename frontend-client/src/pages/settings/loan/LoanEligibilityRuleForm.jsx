import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const INTEREST_FORMULA_OPTIONS = [
  { value: 'COMPOUND_INTEREST', label: 'Compound Interest' },
  { value: 'SIMPLE_INTEREST', label: 'Simple Interest' },
];

const EMPTY_FORM = {
  ruleCode: 'DEFAULT',
  minServiceMonths: '0',
  salaryMultiplier: '',
  minAmountPercentOfSalary: '',
  maxAmountPercentOfSalary: '',
  minTenureMonths: '1',
  maxTenureMonths: '',
  interestFormula: 'COMPOUND_INTEREST',
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

function toOptionalNumberString(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value);
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
    salaryMultiplier: toOptionalNumberString(initialValues.salaryMultiplier),
    minAmountPercentOfSalary: toOptionalNumberString(initialValues.minAmountPercentOfSalary),
    maxAmountPercentOfSalary: toOptionalNumberString(initialValues.maxAmountPercentOfSalary),
    minTenureMonths:
      initialValues.minTenureMonths === undefined || initialValues.minTenureMonths === null
        ? '1'
        : String(initialValues.minTenureMonths),
    maxTenureMonths: toOptionalNumberString(initialValues.maxTenureMonths),
    interestFormula: initialValues.interestFormula ?? 'COMPOUND_INTEREST',
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
    minTenureMonths: Number(form.minTenureMonths || 1),
    interestFormula: form.interestFormula,
    maxEmiPercentOfGross: Number(form.maxEmiPercentOfGross || 60),
    retirementBufferMonths: Number(form.retirementBufferMonths || 3),
    effectiveDate: form.effectiveDate,
    status: form.status,
  };

  if (form.salaryMultiplier !== '') {
    payload.salaryMultiplier = Number(form.salaryMultiplier);
  }

  if (form.minAmountPercentOfSalary !== '') {
    payload.minAmountPercentOfSalary = Number(form.minAmountPercentOfSalary);
  }

  if (form.maxAmountPercentOfSalary !== '') {
    payload.maxAmountPercentOfSalary = Number(form.maxAmountPercentOfSalary);
  }

  if (form.maxTenureMonths !== '') {
    payload.maxTenureMonths = Number(form.maxTenureMonths);
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
        {/*
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
        */}
        <label>
          Min Loan Amount (% of salary)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.minAmountPercentOfSalary}
            onChange={(e) => updateField('minAmountPercentOfSalary', e.target.value)}
            placeholder="e.g. 10"
          />
        </label>
        <label>
          Max Loan Amount (% of salary)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.maxAmountPercentOfSalary}
            onChange={(e) => updateField('maxAmountPercentOfSalary', e.target.value)}
            placeholder="e.g. 80"
          />
        </label>
        <label>
          Min Tenure (months)
          <input
            type="number"
            min="1"
            step="1"
            value={form.minTenureMonths}
            onChange={(e) => updateField('minTenureMonths', e.target.value)}
            required
          />
        </label>
        <label>
          Max Tenure (months, optional)
          <input
            type="number"
            min="1"
            step="1"
            value={form.maxTenureMonths}
            onChange={(e) => updateField('maxTenureMonths', e.target.value)}
            placeholder="Uses loan type max if empty"
          />
        </label>
        {/*
        <label>
          Interest Rate Formula
          <select
            value={form.interestFormula}
            onChange={(e) => updateField('interestFormula', e.target.value)}
            required
          >
            {INTEREST_FORMULA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        */}
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
        {/*
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
        */}
        <label>
          Status
          <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <p className="placeholder-text">
        Rules apply company-wide. Loan amount %, tenure bounds, interest formula, EMI cap, and
        retirement buffer are enforced during employee eligibility preview.
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

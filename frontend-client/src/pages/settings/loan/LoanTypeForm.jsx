import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const CATEGORY_FIELDS = [
  { key: 'isEducationLoan', label: 'Education Loan' },
  { key: 'isComputerLoan', label: 'Computer Loan' },
  { key: 'isVehicleLoan', label: 'Vehicle Loan' },
  { key: 'isHomeLoan', label: 'Home Loan' },
  { key: 'isMarriageLoan', label: 'Marriage Loan' },
];

const EMPTY_FORM = {
  code: '',
  name: '',
  isEducationLoan: false,
  isComputerLoan: false,
  isVehicleLoan: false,
  isHomeLoan: false,
  isMarriageLoan: false,
  maxAmount: '',
  maxTenureMonths: '',
  interestRate: '',
  minServiceYears: '0',
  salaryMultiplier: '',
  isActive: true,
};

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM };
  }

  return {
    code: initialValues.code ?? '',
    name: initialValues.name ?? '',
    isEducationLoan: Boolean(initialValues.isEducationLoan),
    isComputerLoan: Boolean(initialValues.isComputerLoan),
    isVehicleLoan: Boolean(initialValues.isVehicleLoan),
    isHomeLoan: Boolean(initialValues.isHomeLoan),
    isMarriageLoan: Boolean(initialValues.isMarriageLoan),
    maxAmount: initialValues.maxAmount ?? '',
    maxTenureMonths: initialValues.maxTenureMonths ?? '',
    interestRate: initialValues.interestRate ?? '',
    minServiceYears:
      initialValues.minServiceYears === undefined || initialValues.minServiceYears === null
        ? '0'
        : String(initialValues.minServiceYears),
    salaryMultiplier:
      initialValues.salaryMultiplier === null || initialValues.salaryMultiplier === undefined
        ? ''
        : String(initialValues.salaryMultiplier),
    isActive: initialValues.isActive !== false,
  };
}

function buildPayload(form) {
  const payload = {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    isEducationLoan: form.isEducationLoan,
    isComputerLoan: form.isComputerLoan,
    isVehicleLoan: form.isVehicleLoan,
    isHomeLoan: form.isHomeLoan,
    isMarriageLoan: form.isMarriageLoan,
    maxAmount: Number(form.maxAmount),
    maxTenureMonths: Number(form.maxTenureMonths),
    interestRate: Number(form.interestRate),
    minServiceYears: Number(form.minServiceYears || 0),
    isActive: form.isActive,
  };

  if (form.salaryMultiplier !== '') {
    payload.salaryMultiplier = Number(form.salaryMultiplier);
  }

  return payload;
}

export default function LoanTypeForm({
  initialValues = null,
  onSubmit,
  onCancel,
  submitLabel = 'Save Loan Type',
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

  function toggleCategory(key) {
    setForm((current) => ({ ...current, [key]: !current[key] }));
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
      setError(getApiErrorMessage(err, 'Failed to save loan type.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{initialValues ? 'Edit Loan Type' : 'New Loan Type'}</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Code
          <input
            type="text"
            value={form.code}
            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
            required
            maxLength={20}
            placeholder="e.g. EDU"
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
            placeholder="e.g. Education Loan"
          />
        </label>
        <label>
          Max Amount (₹)
          <input
            type="number"
            min="0"
            step="1"
            value={form.maxAmount}
            onChange={(e) => updateField('maxAmount', e.target.value)}
            required
            placeholder="500000"
          />
        </label>
        <label>
          Max Tenure (months)
          <input
            type="number"
            min="1"
            step="1"
            value={form.maxTenureMonths}
            onChange={(e) => updateField('maxTenureMonths', e.target.value)}
            required
            placeholder="60"
          />
        </label>
        <label>
          Interest Rate (%)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.interestRate}
            onChange={(e) => updateField('interestRate', e.target.value)}
            required
            placeholder="8"
          />
        </label>
        <label>
          Min Service (years)
          <input
            type="number"
            min="0"
            step="1"
            value={form.minServiceYears}
            onChange={(e) => updateField('minServiceYears', e.target.value)}
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
      </div>

      <fieldset className="module-fieldset">
        <legend>Loan Category</legend>
        {CATEGORY_FIELDS.map(({ key, label }) => (
          <label key={key} className="checkbox-label">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={() => toggleCategory(key)}
            />
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
        Active (visible to employees when applying)
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

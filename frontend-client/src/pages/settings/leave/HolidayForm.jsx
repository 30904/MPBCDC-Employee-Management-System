import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const HOLIDAY_TYPES = [
  { value: 'NATIONAL', label: 'National' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'OPTIONAL', label: 'Optional' },
];

const EMPTY_FORM = {
  name: '',
  date: '',
  holidayType: 'NATIONAL',
  state: '',
  regionId: '',
  description: '',
  isActive: true,
};

function toFormValues(initialValues) {
  if (!initialValues) {
    return { ...EMPTY_FORM };
  }

  return {
    name: initialValues.name ?? '',
    date: initialValues.date ?? '',
    holidayType: initialValues.holidayType ?? 'NATIONAL',
    state: initialValues.state ?? '',
    regionId: initialValues.region?._id || initialValues.regionId?._id || initialValues.regionId || '',
    description: initialValues.description ?? '',
    isActive: initialValues.isActive !== false,
  };
}

function buildPayload(form) {
  const payload = {
    name: form.name.trim(),
    date: form.date,
    holidayType: form.holidayType,
    state: form.state.trim(),
    description: form.description.trim(),
    isActive: form.isActive,
  };

  if (form.holidayType === 'NATIONAL') {
    payload.regionId = null;
  } else if (form.regionId) {
    payload.regionId = form.regionId;
  } else {
    payload.regionId = null;
  }

  return payload;
}

export default function HolidayForm({
  initialValues = null,
  regionOptions = [],
  onSubmit,
  onCancel,
  submitLabel = 'Save Holiday',
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

      if (field === 'holidayType' && value === 'NATIONAL') {
        next.regionId = '';
      }

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.holidayType === 'REGIONAL' && !form.regionId) {
      setError('Regional holidays require a region.');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(buildPayload(form));
      if (!initialValues) {
        setForm({ ...EMPTY_FORM });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save holiday.'));
    } finally {
      setLoading(false);
    }
  }

  const showRegionField = form.holidayType === 'REGIONAL' || form.holidayType === 'OPTIONAL';

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{initialValues ? 'Edit Holiday' : 'New Holiday'}</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Holiday Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            placeholder="e.g. Independence Day"
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            required
          />
        </label>
        <label>
          Holiday Type
          <select
            value={form.holidayType}
            onChange={(e) => updateField('holidayType', e.target.value)}
            required
          >
            {HOLIDAY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          State
          <input
            type="text"
            value={form.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="e.g. Maharashtra"
          />
        </label>
        {showRegionField && (
          <label>
            Region {form.holidayType === 'REGIONAL' ? '(required)' : '(optional)'}
            <select
              value={form.regionId}
              onChange={(e) => updateField('regionId', e.target.value)}
              required={form.holidayType === 'REGIONAL'}
            >
              <option value="">Select region</option>
              {regionOptions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.label}
                </option>
              ))}
            </select>
          </label>
        )}
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

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => updateField('isActive', e.target.checked)}
        />
        Active (included in leave day calculations)
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

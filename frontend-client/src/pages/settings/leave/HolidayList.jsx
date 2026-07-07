import { useCallback, useEffect, useState } from 'react';
import {
  createHoliday,
  deleteHoliday,
  fetchHolidayRegionOptions,
  fetchHolidays,
  updateHoliday,
} from '../../../api/holidaysApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import HolidayForm from './HolidayForm.jsx';

const HOLIDAY_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'NATIONAL', label: 'National' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'OPTIONAL', label: 'Optional' },
];

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

function regionLabel(holiday) {
  if (holiday.region?.code) {
    return holiday.region.code;
  }

  if (holiday.holidayType === 'NATIONAL') {
    return 'All regions';
  }

  return '—';
}

export default function HolidayList() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [holidayType, setHolidayType] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadRegionOptions = useCallback(async () => {
    try {
      const regions = await fetchHolidayRegionOptions();
      setRegionOptions(regions);
    } catch {
      setRegionOptions([]);
    }
  }, []);

  const loadHolidays = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchHolidays({
        year,
        holidayType: holidayType || undefined,
        limit: 100,
      });
      setHolidays(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load holidays.'));
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  }, [holidayType, year]);

  useEffect(() => {
    loadRegionOptions();
  }, [loadRegionOptions]);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

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

  function openEditForm(holiday) {
    setEditing(holiday);
    setShowForm(true);
    setActionError('');
  }

  async function handleCreate(payload) {
    await createHoliday(payload);
    closeForm();
    await loadHolidays();
  }

  async function handleUpdate(payload) {
    await updateHoliday(editing._id, payload);
    closeForm();
    await loadHolidays();
  }

  async function handleToggleActive(holiday) {
    setActionError('');

    try {
      await updateHoliday(holiday._id, { isActive: !holiday.isActive });
      await loadHolidays();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update holiday status.'));
    }
  }

  async function handleDelete(holiday) {
    const confirmed = window.confirm(`Delete holiday "${holiday.name}"?`);

    if (!confirmed) {
      return;
    }

    setActionError('');

    try {
      await deleteHoliday(holiday._id);
      if (editing?._id === holiday._id) {
        closeForm();
      }
      await loadHolidays();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete holiday.'));
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Holiday Calendar</h3>
          <p className="placeholder-text">
            Manage national, regional, and optional holidays used in leave calculations.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="primary-btn" onClick={openCreateForm}>
            + New Holiday
          </button>
        )}
      </div>

      <div className="card form-grid">
        <label>
          Year
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label>
          Type
          <select value={holidayType} onChange={(e) => setHolidayType(e.target.value)}>
            {HOLIDAY_TYPE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showForm && (
        <HolidayForm
          initialValues={editing}
          regionOptions={regionOptions}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeForm}
          submitLabel={editing ? 'Update Holiday' : 'Create Holiday'}
        />
      )}

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading holidays…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && holidays.length === 0 && (
          <EmptyState
            title="No holidays configured"
            message="Seed defaults with npm run seed:holidays or add national/regional holidays manually."
            action={
              <button type="button" className="primary-btn" onClick={openCreateForm}>
                Create Holiday
              </button>
            }
          />
        )}

        {!loading && holidays.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday._id}>
                    <td>{formatDate(holiday.date)}</td>
                    <td>{holiday.name}</td>
                    <td>{holiday.holidayType}</td>
                    <td>{regionLabel(holiday)}</td>
                    <td>
                      <StatusBadge status={holiday.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => openEditForm(holiday)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => handleToggleActive(holiday)}
                      >
                        {holiday.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="link-btn link-btn--danger"
                        onClick={() => handleDelete(holiday)}
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

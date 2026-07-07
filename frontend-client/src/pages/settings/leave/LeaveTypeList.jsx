import { useCallback, useEffect, useState } from 'react';
import {
  createLeaveType,
  deleteLeaveType,
  fetchLeaveTypes,
  updateLeaveType,
} from '../../../api/leaveTypesApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import LeaveTypeForm from './LeaveTypeForm.jsx';

function ruleSummary(leaveType) {
  const labels = [];

  if (leaveType.allowsHalfDay) labels.push('Half-day');
  if (leaveType.isEncashable) labels.push('Encash');
  if (leaveType.allowsCarryForward) labels.push('Carry-forward');
  if (leaveType.applySandwichRule) labels.push('Sandwich');
  if (leaveType.requiresHrApproval) labels.push('HR approval');

  return labels.length > 0 ? labels.join(', ') : '—';
}

export default function LeaveTypeList() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadLeaveTypes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchLeaveTypes({ limit: 100 });
      setLeaveTypes(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load leave types.'));
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaveTypes();
  }, [loadLeaveTypes]);

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

  function openEditForm(leaveType) {
    setEditing(leaveType);
    setShowForm(true);
    setActionError('');
  }

  async function handleCreate(payload) {
    await createLeaveType(payload);
    closeForm();
    await loadLeaveTypes();
  }

  async function handleUpdate(payload) {
    await updateLeaveType(editing._id, payload);
    closeForm();
    await loadLeaveTypes();
  }

  async function handleToggleActive(leaveType) {
    setActionError('');

    try {
      await updateLeaveType(leaveType._id, { isActive: !leaveType.isActive });
      await loadLeaveTypes();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update leave type status.'));
    }
  }

  async function handleDelete(leaveType) {
    const confirmed = window.confirm(
      `Delete leave type "${leaveType.name}"? This cannot be undone if unused.`
    );

    if (!confirmed) {
      return;
    }

    setActionError('');

    try {
      await deleteLeaveType(leaveType._id);
      if (editing?._id === leaveType._id) {
        closeForm();
      }
      await loadLeaveTypes();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete leave type.'));
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Types</h3>
          <p className="placeholder-text">
            Configure CL, SL, EL, and special leave with entitlement and policy flags.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="primary-btn" onClick={openCreateForm}>
            + New Leave Type
          </button>
        )}
      </div>

      {showForm && (
        <LeaveTypeForm
          initialValues={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeForm}
          submitLabel={editing ? 'Update Leave Type' : 'Create Leave Type'}
        />
      )}

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading leave types…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && leaveTypes.length === 0 && (
          <EmptyState
            title="No leave types configured"
            message="Seed defaults with npm run seed:leave-types or create CL, SL, EL, and Special Leave manually."
            action={
              <button type="button" className="primary-btn" onClick={openCreateForm}>
                Create Leave Type
              </button>
            }
          />
        )}

        {!loading && leaveTypes.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Entitlement</th>
                  <th>Rules</th>
                  <th>Carry Max</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((leaveType) => (
                  <tr key={leaveType._id}>
                    <td>
                      <code>{leaveType.code}</code>
                    </td>
                    <td>{leaveType.name}</td>
                    <td>{leaveType.annualEntitlement} days</td>
                    <td>{ruleSummary(leaveType)}</td>
                    <td>
                      {leaveType.allowsCarryForward ? leaveType.maxCarryForwardDays : '—'}
                    </td>
                    <td>
                      <StatusBadge status={leaveType.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => openEditForm(leaveType)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => handleToggleActive(leaveType)}
                      >
                        {leaveType.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="link-btn link-btn--danger"
                        onClick={() => handleDelete(leaveType)}
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

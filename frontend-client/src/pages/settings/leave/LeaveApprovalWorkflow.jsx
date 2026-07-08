import { useCallback, useEffect, useState } from 'react';
import {
  createApprovalMatrix,
  deleteApprovalMatrix,
  fetchApprovalMatrices,
  initializeLeaveApprovalMatrix,
  updateApprovalMatrix,
} from '../../../api/approvalMatricesApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import LeaveApprovalMatrixForm from './LeaveApprovalMatrixForm.jsx';

const WORKFLOW_FLOW = 'Submitted → Admin approval → Approved → Balance Update';

export default function LeaveApprovalWorkflow() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchApprovalMatrices({ module: 'LEAVE', limit: 100 });
      setRows(items.sort((left, right) => left.level - right.level));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load approval workflow.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setActionError('');
  }

  async function handleInitialize() {
    setInitializing(true);
    setActionError('');

    try {
      await initializeLeaveApprovalMatrix();
      await loadRows();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to initialize default workflow.'));
    } finally {
      setInitializing(false);
    }
  }

  async function handleCreate(payload) {
    await createApprovalMatrix(payload);
    closeForm();
    await loadRows();
  }

  async function handleUpdate(payload) {
    await updateApprovalMatrix(editing._id, payload);
    closeForm();
    await loadRows();
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete level ${row.level} (Admin)?`)) {
      return;
    }

    setActionError('');

    try {
      await deleteApprovalMatrix(row._id);
      await loadRows();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete approval level.'));
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Approval Workflow</h3>
          <p className="placeholder-text">{WORKFLOW_FLOW}</p>
          <p className="placeholder-text">
            Company admin reviews and approves submitted leave applications in one step.
          </p>
        </div>
        <div className="header-actions">
          {!showForm && rows.length === 0 && (
            <button
              type="button"
              className="secondary-btn"
              onClick={handleInitialize}
              disabled={initializing}
            >
              {initializing ? 'Initializing…' : 'Use Default Workflow'}
            </button>
          )}
          {!showForm && rows.length === 0 && (
            <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
              + Configure Workflow
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <LeaveApprovalMatrixForm
          initialValues={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeForm}
          submitLabel={editing ? 'Update Level' : 'Add Level'}
        />
      )}

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading workflow levels…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <EmptyState
            title="No leave approval workflow configured"
            message="Initialize the default single-step admin approval workflow."
            action={
              <button
                type="button"
                className="primary-btn"
                onClick={handleInitialize}
                disabled={initializing}
              >
                Initialize Default Workflow
              </button>
            }
          />
        )}

        {!loading && rows.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Code</th>
                  <th>Approver</th>
                  <th>SLA</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td>L{row.level}</td>
                    <td>
                      <code>{row.code}</code>
                    </td>
                    <td>Admin</td>
                    <td>{row.slaDays} days</td>
                    <td>
                      <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => {
                          setEditing(row);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-btn link-btn--danger"
                        onClick={() => handleDelete(row)}
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

import { useCallback, useEffect, useState } from 'react';
import {
  createLoanType,
  deleteLoanType,
  fetchLoanTypes,
  updateLoanType,
} from '../../../api/loanTypesApi.js';
import EmptyState from '../../../components/EmptyState.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import LoanTypeForm from './LoanTypeForm.jsx';

const CATEGORY_FIELDS = [
  { key: 'isEducationLoan', label: 'Education' },
  { key: 'isComputerLoan', label: 'Computer' },
  { key: 'isVehicleLoan', label: 'Vehicle' },
  { key: 'isHomeLoan', label: 'Home' },
  { key: 'isMarriageLoan', label: 'Marriage' },
];

function formatCurrency(amount) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return '—';
  }

  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function categorySummary(loanType) {
  const labels = CATEGORY_FIELDS.filter(({ key }) => loanType[key]).map(({ label }) => label);
  return labels.length > 0 ? labels.join(', ') : '—';
}

export default function LoanTypeList() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadLoanTypes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { items } = await fetchLoanTypes({ limit: 100 });
      setLoanTypes(items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load loan types.'));
      setLoanTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoanTypes();
  }, [loadLoanTypes]);

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

  function openEditForm(loanType) {
    setEditing(loanType);
    setShowForm(true);
    setActionError('');
  }

  async function handleCreate(payload) {
    await createLoanType(payload);
    closeForm();
    await loadLoanTypes();
  }

  async function handleUpdate(payload) {
    await updateLoanType(editing._id, payload);
    closeForm();
    await loadLoanTypes();
  }

  async function handleToggleActive(loanType) {
    setActionError('');

    try {
      await updateLoanType(loanType._id, { isActive: !loanType.isActive });
      await loadLoanTypes();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update loan type status.'));
    }
  }

  async function handleDelete(loanType) {
    const confirmed = window.confirm(
      `Delete loan type "${loanType.name}"? This cannot be undone if unused.`
    );

    if (!confirmed) {
      return;
    }

    setActionError('');

    try {
      await deleteLoanType(loanType._id);
      if (editing?._id === loanType._id) {
        closeForm();
      }
      await loadLoanTypes();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to delete loan type.'));
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Loan Types</h3>
          <p className="placeholder-text">
            Configure loan products available to employees. Only active types appear on the apply screen.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="primary-btn" onClick={openCreateForm}>
            + New Loan Type
          </button>
        )}
      </div>

      {showForm && (
        <LoanTypeForm
          initialValues={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeForm}
          submitLabel={editing ? 'Update Loan Type' : 'Create Loan Type'}
        />
      )}

      <div className="card">
        {actionError && <div className="form-error">{actionError}</div>}
        {loading && <p className="placeholder-text">Loading loan types…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && loanTypes.length === 0 && (
          <EmptyState
            title="No loan types configured"
            message="Create Education Loan with max ₹5,00,000, 60 months, and 8% interest to get started."
            action={
              <button type="button" className="primary-btn" onClick={openCreateForm}>
                Create Loan Type
              </button>
            }
          />
        )}

        {!loading && loanTypes.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Max Amount</th>
                  <th>Tenure</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {loanTypes.map((loanType) => (
                  <tr key={loanType._id}>
                    <td>
                      <code>{loanType.code}</code>
                    </td>
                    <td>{loanType.name}</td>
                    <td>{categorySummary(loanType)}</td>
                    <td>{formatCurrency(loanType.maxAmount)}</td>
                    <td>{loanType.maxTenureMonths} mo</td>
                    <td>{loanType.interestRate}%</td>
                    <td>
                      <StatusBadge status={loanType.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => openEditForm(loanType)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => handleToggleActive(loanType)}
                      >
                        {loanType.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="link-btn link-btn--danger"
                        onClick={() => handleDelete(loanType)}
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

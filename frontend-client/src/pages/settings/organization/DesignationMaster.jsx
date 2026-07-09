import { useEffect, useState } from 'react';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

const initialFormState = {
  code: '',
  name: '',
  status: 'Active',
};

export default function DesignationMaster() {
  const [designations, setDesignations] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);

  useEffect(() => {
    let isMounted = true;

    async function loadDesignations() {
      try {
        const response = await apiClient.get('/designations');
        if (isMounted) {
          setDesignations(response.data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load designation master data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDesignations();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    setFormData(initialFormState);
    setEditingId(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditDesignation(designation) {
    setEditingId(designation.id);
    setFormData({
      code: designation.code || '',
      name: designation.name || '',
      status: designation.status || 'Active',
    });
    setError('');
  }

  async function refreshDesignations() {
    const { data } = await apiClient.get('/designations');
    setDesignations(data.data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const request = isEditing
        ? apiClient.put(`/designations/${editingId}`, formData)
        : apiClient.post('/designations', formData);

      await request;
      await refreshDesignations();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save designation.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Designation Master"
        subtitle="Manage company designation records"
        action={(
          <button type="button" className="primary-btn" onClick={resetForm}>
            + New Designation
          </button>
        )}
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p className="placeholder-text">Maintain designation code, name, and status for the current company.</p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Designation Code</span>
            <input name="code" value={formData.code} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Designation Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Status</span>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Designation' : 'Create Designation'}
            </button>
            {isEditing && (
              <button type="button" className="primary-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <h3>Designation Records</h3>
          <p className="placeholder-text">List of designation masters scoped to the current company.</p>
        </div>

        {loading ? (
          <p className="placeholder-text">Loading designations...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {designations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No designations found.
                    </td>
                  </tr>
                ) : (
                  designations.map((designation) => (
                    <tr key={designation.id}>
                      <td>{designation.code}</td>
                      <td>{designation.name}</td>
                      <td>
                        <span className={`status-pill status-${designation.status?.toLowerCase()}`}>
                          {designation.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEditDesignation(designation)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

const initialFormState = {
  name: '',
  status: 'Active',
};

export default function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const response = await apiClient.get('/departments');
        if (isMounted) {
          setDepartments(response.data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load department master data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

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

  function handleEditDepartment(department) {
    setEditingId(department.id);
    setFormData({
      name: department.name || '',
      status: department.status || 'Active',
    });
    setError('');
  }

  async function refreshDepartments() {
    const { data } = await apiClient.get('/departments');
    setDepartments(data.data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const request = isEditing
        ? apiClient.put(`/departments/${editingId}`, formData)
        : apiClient.post('/departments', formData);

      await request;
      await refreshDepartments();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save department.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Department Master"
        subtitle="Manage company department records"
        action={(
          <button type="button" className="primary-btn" onClick={resetForm}>
            + New Department
          </button>
        )}
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p className="placeholder-text">Maintain department name and status for the current company.</p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Department Name</span>
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
              {saving ? 'Saving...' : isEditing ? 'Update Department' : 'Create Department'}
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
          <h3>Department Records</h3>
          <p className="placeholder-text">List of department masters scoped to the current company.</p>
        </div>

        {loading ? (
          <p className="placeholder-text">Loading departments...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state">
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.id}>
                      <td>{department.name}</td>
                      <td>
                        <span className={`status-pill status-${department.status?.toLowerCase()}`}>
                          {department.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEditDepartment(department)}>
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

import { useEffect, useState } from 'react';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

const initialFormState = {
  code: '',
  name: '',
  approvalMatrixApplicable: 'false',
  status: 'Active',
};

function formatBoolean(value) {
  return value ? 'Yes' : 'No';
}

export default function GradeMaster() {
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);

  useEffect(() => {
    let isMounted = true;

    async function loadGrades() {
      try {
        const response = await apiClient.get('/grades');

        if (isMounted) {
          setGrades(response.data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load grade master data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadGrades();

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

  function handleEditGrade(grade) {
    setEditingId(grade.id);
    setFormData({
      code: grade.code || '',
      name: grade.name || '',
      approvalMatrixApplicable: grade.approvalMatrixApplicable ? 'true' : 'false',
      status: grade.status || 'Active',
    });
    setError('');
  }

  async function refreshGrades() {
    const { data } = await apiClient.get('/grades');
    setGrades(data.data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        approvalMatrixApplicable: formData.approvalMatrixApplicable === 'true',
      };

      const request = isEditing
        ? apiClient.put(`/grades/${editingId}`, payload)
        : apiClient.post('/grades', payload);

      await request;
      await refreshGrades();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save grade.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Grade Master"
        subtitle="Manage company grade records"
        action={(
          <button type="button" className="primary-btn" onClick={resetForm}>
            + New Grade
          </button>
        )}
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p className="placeholder-text">
          Maintain grade code, name, approval matrix applicability, and status for the current company.
        </p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Grade Code</span>
            <input name="code" value={formData.code} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Grade Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Approval Matrix Applicable</span>
            <select
              name="approvalMatrixApplicable"
              value={formData.approvalMatrixApplicable}
              onChange={handleChange}
              required
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
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
              {saving ? 'Saving...' : isEditing ? 'Update Grade' : 'Create Grade'}
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
          <h3>Grade Records</h3>
          <p className="placeholder-text">List of grade masters scoped to the current company.</p>
        </div>

        {loading ? (
          <p className="placeholder-text">Loading grades...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Approval Matrix</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No grades found.
                    </td>
                  </tr>
                ) : (
                  grades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.code}</td>
                      <td>{grade.name}</td>
                      <td>{formatBoolean(grade.approvalMatrixApplicable)}</td>
                      <td>
                        <span className={`status-pill status-${grade.status?.toLowerCase()}`}>
                          {grade.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEditGrade(grade)}>
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

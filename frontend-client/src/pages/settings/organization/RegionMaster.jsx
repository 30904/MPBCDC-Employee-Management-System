import { useEffect, useState } from 'react';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

const initialFormState = {
  code: '',
  name: '',
};

export default function RegionMaster() {
  const [regions, setRegions] = useState([]);
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
        const response = await apiClient.get('/regions');

        if (isMounted) {
          setRegions(response.data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load region master data.');
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

  function handleEditRegion(region) {
    setEditingId(region.id);
    setFormData({
      code: region.code || '',
      name: region.name || '',
    });
    setError('');
  }

  async function refreshRegions() {
    const { data } = await apiClient.get('/regions');
    setRegions(data.data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const request = isEditing
        ? apiClient.put(`/regions/${editingId}`, formData)
        : apiClient.post('/regions', formData);

      await request;
      await refreshRegions();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save region.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Region Master"
        subtitle="Manage company region records"
        action={(
          <button type="button" className="primary-btn" onClick={resetForm}>
            + New Region
          </button>
        )}
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p className="placeholder-text">Maintain region code and name for the current company.</p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Region Code</span>
            <input name="code" value={formData.code} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Region Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Region' : 'Create Region'}
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
          <h3>Region Records</h3>
          <p className="placeholder-text">List of region masters scoped to the current company.</p>
        </div>

        {loading ? (
          <p className="placeholder-text">Loading regions...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state">
                      No regions found.
                    </td>
                  </tr>
                ) : (
                  regions.map((region) => (
                    <tr key={region.id}>
                      <td>{region.code}</td>
                      <td>{region.name}</td>
                      <td className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEditRegion(region)}>
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

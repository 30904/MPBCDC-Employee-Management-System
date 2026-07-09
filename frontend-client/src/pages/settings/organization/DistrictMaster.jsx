import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../../api/apiClient.js';
import { fetchRegions } from '../../../api/organizationMastersApi.js';
import PageHeader from '../../../components/PageHeader.jsx';

const initialFormState = {
  code: '',
  name: '',
  regionId: '',
};

function formatRegionLabel(region) {
  if (!region) {
    return '-';
  }

  if (region.code && region.name) {
    return `${region.code} - ${region.name}`;
  }

  return region.name || region.code || '-';
}

export default function DistrictMaster() {
  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);
  const regionOptions = useMemo(() => regions, [regions]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [districtResponse, regionResponse] = await Promise.all([
          apiClient.get('/districts'),
          fetchRegions(),
        ]);

        if (isMounted) {
          setDistricts(districtResponse.data.data ?? []);
          setRegions(regionResponse ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load district master data.');
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

  function handleEditDistrict(district) {
    setEditingId(district.id);
    setFormData({
      code: district.code || '',
      name: district.name || '',
      regionId: district.regionId?.id || district.regionId || '',
    });
    setError('');
  }

  async function refreshDistricts() {
    const { data } = await apiClient.get('/districts');
    setDistricts(data.data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const request = isEditing
        ? apiClient.put(`/districts/${editingId}`, formData)
        : apiClient.post('/districts', formData);

      await request;
      await refreshDistricts();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save district.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="District Master"
        subtitle="Manage company district records"
        action={(
          <button type="button" className="primary-btn" onClick={resetForm}>
            + New District
          </button>
        )}
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p className="placeholder-text">
          Maintain district code, name, and region mapping for the current company.
        </p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>District Code</span>
            <input name="code" value={formData.code} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>District Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Region</span>
            <select name="regionId" value={formData.regionId} onChange={handleChange} required>
              <option value="">Select region</option>
              {regionOptions.map((region) => (
                <option key={region.id} value={region.id}>
                  {formatRegionLabel(region)}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update District' : 'Create District'}
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
          <h3>District Records</h3>
          <p className="placeholder-text">List of district masters scoped to the current company.</p>
        </div>

        {loading ? (
          <p className="placeholder-text">Loading districts...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Region</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {districts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No districts found.
                    </td>
                  </tr>
                ) : (
                  districts.map((district) => (
                    <tr key={district.id}>
                      <td>{district.code}</td>
                      <td>{district.name}</td>
                      <td>
                        {district.regionId?.name
                          ? `${district.regionId.code ? `${district.regionId.code} - ` : ''}${district.regionId.name}`
                          : district.regionId?.code || '-'}
                      </td>
                      <td className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEditDistrict(district)}>
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

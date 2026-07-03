import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCompany, updateCompany } from '../../api/companiesApi.js';
import CompanyModuleFlags from '../../components/companies/CompanyModuleFlags.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { setSelectedCompanyId } from '../../utils/auth.js';

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCompany = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const record = await fetchCompany(id);
      setCompany(record);
      setSelectedCompanyId(id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load company.'));
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  async function handleSave() {
    if (!company) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await updateCompany(id, {
        name: company.name,
        status: company.status,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        moduleFlags: company.moduleFlags,
      });
      setCompany(updated);
      setMessage('Company updated successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update company.'));
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setCompany((current) => ({ ...current, [field]: value }));
  }

  function updateModuleFlag(key, value) {
    setCompany((current) => ({
      ...current,
      moduleFlags: { ...current.moduleFlags, [key]: value },
    }));
  }

  if (loading) {
    return <p className="placeholder-text">Loading company…</p>;
  }

  if (error && !company) {
    return (
      <div className="card">
        <div className="form-error">{error}</div>
        <Link to="/companies">← Back to companies</Link>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card">
        <div className="form-error">Company not found.</div>
        <Link to="/companies">← Back to companies</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={company.name}
        subtitle={`Tenant code: ${company.code}`}
        action={
          <Link to={`/companies/${id}/users`} className="primary-btn">
            Manage Client Admin Users
          </Link>
        }
      />

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="card detail-grid">
        <div>
          <h3>Company Profile</h3>
          <div className="form-grid">
            <label>
              Company Name
              <input
                type="text"
                value={company.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </label>
            <label>
              Status
              <select value={company.status} onChange={(e) => updateField('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <label>
              Contact Email
              <input
                type="email"
                value={company.contactEmail || ''}
                onChange={(e) => updateField('contactEmail', e.target.value)}
              />
            </label>
            <label>
              Contact Phone
              <input
                type="tel"
                value={company.contactPhone || ''}
                onChange={(e) => updateField('contactPhone', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div>
          <h3>Tenant Context</h3>
          <p className="meta-line">
            <strong>Company ID:</strong> <code>{company._id}</code>
          </p>
          <p className="meta-line">
            <strong>Status:</strong> <StatusBadge status={company.status} />
          </p>
          <p className="meta-line meta-line--hint">
            Selected tenant is sent as <code>x-company-id</code> on API calls from this portal.
          </p>
        </div>
      </div>

      <div className="card">
        <CompanyModuleFlags
          moduleFlags={company.moduleFlags}
          editable
          onChange={updateModuleFlag}
        />
        <div className="form-actions">
          <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link to="/companies" className="secondary-btn">
            ← Back to companies
          </Link>
        </div>
      </div>
    </div>
  );
}

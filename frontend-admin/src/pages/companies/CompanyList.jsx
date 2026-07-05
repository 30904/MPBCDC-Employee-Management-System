import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createCompany, fetchCompanies } from '../../api/companiesApi.js';
import CompanyForm from '../../components/companies/CompanyForm.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';

function moduleSummary(moduleFlags = {}) {
  const enabled = [
    moduleFlags.loanManagement !== false && 'Loan',
    moduleFlags.leaveManagement !== false && 'Leave',
    moduleFlags.serviceRecords !== false && 'ESR',
  ].filter(Boolean);

  return enabled.length > 0 ? enabled.join(', ') : 'None';
}

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const list = await fetchCompanies();
      setCompanies(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load companies.'));
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  async function handleCreateCompany(payload) {
    try {
      await createCompany(payload);
      setShowForm(false);
      await loadCompanies();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create company.'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Create and manage MPBCDC tenant companies"
        action={
          <button type="button" className="primary-btn" onClick={() => setShowForm((open) => !open)}>
            {showForm ? 'Close Form' : '+ New Company'}
          </button>
        }
      />

      {showForm && (
        <CompanyForm onSubmit={handleCreateCompany} onCancel={() => setShowForm(false)} />
      )}

      <div className="card">
        {loading && <p className="placeholder-text">Loading companies…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && companies.length === 0 && (
          <EmptyState
            title="No companies yet"
            message="Provision your first tenant to enable client portal access."
            action={
              <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
                Create Company
              </button>
            }
          />
        )}

        {!loading && companies.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Modules</th>
                  <th>Contact</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company._id}>
                    <td>
                      <code>{company.code}</code>
                    </td>
                    <td>{company.name}</td>
                    <td>
                      <StatusBadge status={company.status} />
                    </td>
                    <td>{moduleSummary(company.moduleFlags)}</td>
                    <td>{company.contactEmail || '—'}</td>
                    <td className="table-actions">
                      <Link to={`/companies/${company._id}`}>View</Link>
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

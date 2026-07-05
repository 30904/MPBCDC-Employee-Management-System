import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createCompanyUser, fetchCompanyUsers } from '../../api/companiesApi.js';
import UserForm from '../../components/companies/UserForm.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { setSelectedCompanyId } from '../../utils/auth.js';

export default function CompanyUsers() {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const list = await fetchCompanyUsers(id);
      setUsers(Array.isArray(list) ? list : []);
      setSelectedCompanyId(id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleCreateUser(payload) {
    try {
      await createCompanyUser(id, payload);
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to create user.'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Client Admin Users"
        subtitle="Provision CLIENT_ADMIN users for this tenant"
        action={
          <button type="button" className="primary-btn" onClick={() => setShowForm((open) => !open)}>
            {showForm ? 'Close Form' : '+ Add User'}
          </button>
        }
      />

      {showForm && <UserForm onSubmit={handleCreateUser} onCancel={() => setShowForm(false)} />}

      <div className="card">
        {loading && <p className="placeholder-text">Loading users…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && users.length === 0 && (
          <EmptyState
            title="No users provisioned"
            message="Create a CLIENT_ADMIN account so this company can access the client portal."
            action={
              <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
                Add User
              </button>
            }
          />
        )}

        {!loading && users.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Login ID</th>
                  <th>Roles</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.loginId}</td>
                    <td>{user.roles?.join(', ')}</td>
                    <td>
                      <StatusBadge status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-actions">
          <Link to={`/companies/${id}`} className="secondary-btn">
            ← Back to company detail
          </Link>
        </div>
      </div>
    </div>
  );
}

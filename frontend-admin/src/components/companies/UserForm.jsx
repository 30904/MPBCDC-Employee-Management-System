import { useState } from 'react';

const PROVISION_ROLES = ['CLIENT_ADMIN'];

export default function UserForm({ onSubmit, onCancel }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roles, setRoles] = useState(['CLIENT_ADMIN']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ loginId, password, roles });
      setLoginId('');
      setPassword('');
      setConfirmPassword('');
      setRoles(['CLIENT_ADMIN']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>Add Client Admin User</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Login ID
          <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
        </label>
        <label>
          Role
          <select value={roles[0]} onChange={(e) => setRoles([e.target.value])}>
            {PROVISION_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Creating…' : 'Add User'}
        </button>
      </div>
    </form>
  );
}

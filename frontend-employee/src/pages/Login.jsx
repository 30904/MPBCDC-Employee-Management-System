import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import { getApiErrorMessage, unwrapApiData } from '../api/response.js';
import { setToken, setUser } from '../utils/auth.js';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const accessDenied = location.state?.error === 'access-denied';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        loginId: employeeCode,
        password,
      });
      const payload = unwrapApiData(response);

      setToken(payload.token);
      setUser(payload.user);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Invalid employee code or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>MPBCDC Employee ESS</h1>
        <p className="login-subtitle">Sign in with your Employee Code</p>

        {accessDenied && (
          <div className="login-error">
            Access denied. This portal is for employees only. Admins must use the client portal.
          </div>
        )}
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="employeeCode">Employee Code</label>
        <input
          id="employeeCode"
          type="text"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          required
          autoComplete="username"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

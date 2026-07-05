import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import { getApiErrorMessage, unwrapApiData } from '../api/response.js';
import { setToken, setUser } from '../utils/auth.js';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const accessDenied = location.state?.error === 'access-denied';
  const denyReason = location.state?.reason;

  function accessDeniedMessage() {
    if (denyReason === 'no-company') {
      return 'Your account is not linked to a company. Contact your Super Admin.';
    }
    if (denyReason === 'foreign-portal') {
      return 'You are signed in to another MPBCDC portal. Use the client portal login below.';
    }
    return 'Access denied. This portal is for client roles only. Employees must use the ESS portal.';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { loginId, password });
      const payload = unwrapApiData(response);

      setToken(payload.token);
      setUser(payload.user);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>MPBCDC Client Portal</h1>
        <p className="login-subtitle">HR · Finance · Manager · Admin</p>

        {accessDenied && <div className="login-error">{accessDeniedMessage()}</div>}
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="loginId">Login ID</label>
        <input
          id="loginId"
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
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

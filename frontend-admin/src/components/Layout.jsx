import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth.js';
import './Layout.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/companies', label: 'Companies' },
  { to: '/audit-logs', label: 'Audit Logs' },
];

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>MPBCDC</h1>
          <p>Super Admin</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

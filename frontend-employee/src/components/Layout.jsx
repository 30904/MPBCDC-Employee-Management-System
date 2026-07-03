import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getCompanyId, getUser } from '../utils/auth.js';
import { getNavItemsForUser } from '../utils/roleMenuMap.js';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const navItems = getNavItemsForUser(user);
  const companyId = getCompanyId();
  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>MPBCDC</h1>
          <p>Employee Self-Service</p>
          {user?.employeeName && <span className="employee-name">{user.employeeName}</span>}
          {companyId && (
            <span className="company-badge" title="Tenant from JWT companyId">
              Org: {companyId.slice(-6)}
            </span>
          )}        </div>
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

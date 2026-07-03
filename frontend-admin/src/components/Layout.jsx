import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, getSelectedCompanyId, getUser } from '../utils/auth.js';
import { getNavItemsForUser } from '../utils/roleMenuMap.js';
import './Layout.css';

function isNavItemActive(pathname, item, isActive) {
  if (isActive) {
    return true;
  }

  if (!item.pathPrefix) {
    return false;
  }

  return pathname === item.pathPrefix || pathname.startsWith(`${item.pathPrefix}/`);
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const navItems = getNavItemsForUser(user);
  const selectedCompanyId = getSelectedCompanyId();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="layout">
      <button
        type="button"
        className="sidebar-toggle"
        aria-label="Toggle navigation"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <h1>MPBCDC</h1>
          <p>Super Admin</p>
          {user?.loginId && <span className="user-badge">{user.loginId}</span>}
          {selectedCompanyId && (
            <span className="role-badge" title="Active tenant for x-company-id API calls">
              Tenant: {selectedCompanyId.slice(-6)}
            </span>
          )}
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                isNavItemActive(location.pathname, item, isActive) ? 'nav-link active' : 'nav-link'
              }
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

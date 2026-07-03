import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth.js';
import { getMenuForUser } from '../utils/roleMenuMap.js';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const menuSections = getMenuForUser(user);

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>MPBCDC</h1>
          <p>Client Portal</p>
          {user?.roles?.length > 0 && (
            <span className="role-badge">{user.roles.join(', ')}</span>
          )}
        </div>
        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div key={section.label} className="nav-section">
              <p className="nav-section-label">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
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

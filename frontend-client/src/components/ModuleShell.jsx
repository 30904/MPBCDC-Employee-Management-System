import { NavLink, Outlet, useLocation } from 'react-router-dom';
import PageHeader from './PageHeader.jsx';

function isTabActive(pathname, tabPath, end) {
  if (end) {
    return (
      pathname.endsWith(tabPath) ||
      pathname.endsWith(`${tabPath}/`) ||
      pathname.includes(`/${tabPath}/`)
    );
  }

  return pathname.includes(`/${tabPath}`);
}

export default function ModuleShell({ title, subtitle, tabs = [], action }) {
  const { pathname } = useLocation();

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} action={action} />
      {tabs.length > 0 && (
        <nav className="sub-nav" aria-label={`${title} sections`}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={() =>
                isTabActive(pathname, tab.path, tab.end) ? 'sub-nav-link active' : 'sub-nav-link'
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}
      <Outlet />
    </div>
  );
}

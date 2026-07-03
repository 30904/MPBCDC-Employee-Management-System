import Layout from '../components/Layout.jsx';
import ModuleRouteGuard from './ModuleRouteGuard.jsx';

/** Private shell — every child route is checked against roleMenuMap. */
export default function GuardedLayout() {
  return (
    <ModuleRouteGuard>
      <Layout />
    </ModuleRouteGuard>
  );
}

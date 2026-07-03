import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import DashboardCharts from '../components/charts/DashboardCharts.jsx';
import '../components/charts/registerCharts.js';

export default function Dashboard() {
  const location = useLocation();
  const moduleDenied = location.state?.error === 'module-access-denied';

  return (
    <div>
      <PageHeader
        title="MIS Dashboard"
        subtitle="Role-filtered overview for your organization"
      />
      {moduleDenied && (
        <div className="alert alert-warning">
          You do not have permission to access that module.
        </div>
      )}
      <DashboardCharts />
    </div>
  );
}

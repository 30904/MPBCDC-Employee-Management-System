import PageHeader from '../components/PageHeader.jsx';
import ModuleAccessDeniedAlert from '../components/ModuleAccessDeniedAlert.jsx';
import DashboardCharts from '../components/charts/DashboardCharts.jsx';
import '../components/charts/registerCharts.js';

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="MIS Dashboard"
        subtitle="Role-filtered overview for your organization"
      />
      <ModuleAccessDeniedAlert />
      <DashboardCharts />
    </div>
  );
}

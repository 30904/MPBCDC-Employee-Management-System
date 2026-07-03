import PageHeader from '../components/PageHeader.jsx';
import ModuleAccessDeniedAlert from '../components/ModuleAccessDeniedAlert.jsx';
import DashboardCharts from '../components/charts/DashboardCharts.jsx';
import '../components/charts/registerCharts.js';

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="My Dashboard"
        subtitle="Personal overview — leave balances, loans, and pending requests"
      />
      <ModuleAccessDeniedAlert />
      <DashboardCharts />
    </div>
  );
}

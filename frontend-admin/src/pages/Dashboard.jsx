import PageHeader from '../components/PageHeader.jsx';
import DashboardCharts from '../components/charts/DashboardCharts.jsx';
import '../components/charts/registerCharts.js';

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Platform Dashboard" subtitle="Cross-tenant overview for MPBCDC deployments" />
      <DashboardCharts />
    </div>
  );
}

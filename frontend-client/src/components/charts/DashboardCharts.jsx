import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { chartDefaults } from './registerCharts.js';
import './DashboardCharts.css';

// Placeholder data — replace with GET /api/reports/* when Phase 4 APIs are ready
const pendingApprovalsData = {
  labels: ['Loans', 'Leaves'],
  datasets: [
    {
      label: 'Pending approvals',
      data: [12, 8],
      backgroundColor: ['#2563eb', '#16a34a'],
    },
  ],
};

const workforceData = {
  labels: ['Active', 'Inactive'],
  datasets: [
    {
      data: [248, 12],
      backgroundColor: ['#22c55e', '#94a3b8'],
    },
  ],
};

const outstandingLoansData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Outstanding (₹ Lakhs)',
      data: [42, 40, 38, 36, 35, 33],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.3,
    },
  ],
};

const leaveUtilizationData = {
  labels: ['CL', 'SL', 'EL'],
  datasets: [
    {
      label: 'Availed %',
      data: [65, 40, 28],
      backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6'],
    },
  ],
};

export default function DashboardCharts() {
  return (
    <div className="dashboard-charts">
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-value">260</span>
          <span className="stat-label">Total employees</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">248</span>
          <span className="stat-label">Active employees</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">8</span>
          <span className="stat-label">Pending leaves</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">12</span>
          <span className="stat-label">Pending loans</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">5</span>
          <span className="stat-label">Retirement due (90d)</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Pending Approvals</h3>
          <div className="chart-container">
            <Bar data={pendingApprovalsData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, title: { display: false } } }} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Workforce Status</h3>
          <div className="chart-container chart-container--compact">
            <Doughnut data={workforceData} options={chartDefaults} />
          </div>
        </div>
        <div className="chart-card chart-card--wide">
          <h3>Outstanding Loans Trend</h3>
          <div className="chart-container">
            <Line data={outstandingLoansData} options={chartDefaults} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Leave Utilization</h3>
          <div className="chart-container">
            <Bar data={leaveUtilizationData} options={chartDefaults} />
          </div>
        </div>
      </div>
      <p className="chart-note">Sample data shown until report APIs are connected in Phase 4.</p>
    </div>
  );
}

import { Bar, Doughnut } from 'react-chartjs-2';
import { chartDefaults } from './registerCharts.js';
import './DashboardCharts.css';

// Placeholder — wire to GET /api/leave-balances/my and loan APIs in module phases
const leaveBalanceData = {
  labels: ['CL', 'SL', 'EL'],
  datasets: [
    {
      label: 'Days remaining',
      data: [6, 10, 18],
      backgroundColor: ['#22c55e', '#3b82f6', '#8b5cf6'],
    },
  ],
};

const loanProgressData = {
  labels: ['Paid', 'Remaining'],
  datasets: [
    {
      data: [14, 46],
      backgroundColor: ['#16a34a', '#e2e8f0'],
    },
  ],
};

const pendingRequestsData = {
  labels: ['Leave', 'Loan'],
  datasets: [
    {
      label: 'Pending',
      data: [1, 0],
      backgroundColor: ['#f59e0b', '#2563eb'],
    },
  ],
};

export default function DashboardCharts() {
  return (
    <div className="dashboard-charts">
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-value">6 / 10 / 18</span>
          <span className="stat-label">CL · SL · EL balance</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">₹8,450</span>
          <span className="stat-label">Active loan EMI</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">05-Aug-2026</span>
          <span className="stat-label">Next EMI date</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">1</span>
          <span className="stat-label">Pending requests</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Leave Balances</h3>
          <div className="chart-container">
            <Bar data={leaveBalanceData} options={chartDefaults} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Loan Repayment Progress</h3>
          <div className="chart-container chart-container--compact">
            <Doughnut
              data={loanProgressData}
              options={{
                ...chartDefaults,
                plugins: {
                  ...chartDefaults.plugins,
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.label}: ${ctx.raw} EMIs`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>Pending Requests</h3>
          <div className="chart-container">
            <Bar data={pendingRequestsData} options={chartDefaults} />
          </div>
        </div>
      </div>
      <p className="chart-note">Sample data shown until ESS APIs are connected.</p>
    </div>
  );
}

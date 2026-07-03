import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import apiClient from '../../api/apiClient.js';
import { buildPaginationQuery, unwrapPaginatedData } from '../../api/response.js';
import { chartDefaults } from './registerCharts.js';
import './DashboardCharts.css';

function buildModuleChart(companies) {
  const loan = companies.filter((c) => c.moduleFlags?.loanManagement !== false).length;
  const leave = companies.filter((c) => c.moduleFlags?.leaveManagement !== false).length;
  const service = companies.filter((c) => c.moduleFlags?.serviceRecords !== false).length;

  return {
    labels: ['Loan Mgmt', 'Leave Mgmt', 'Service Records'],
    datasets: [
      {
        label: 'Tenants with module enabled',
        data: [loan, leave, service],
        backgroundColor: ['#2563eb', '#16a34a', '#8b5cf6'],
      },
    ],
  };
}

function buildStatusChart(companies) {
  const active = companies.filter((c) => c.status === 'Active').length;
  const inactive = companies.length - active;

  return {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ['#22c55e', '#94a3b8'],
      },
    ],
  };
}

export default function DashboardCharts() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await apiClient.get(`/companies?${buildPaginationQuery({ page: 1, limit: 100 })}`);
        const { items } = unwrapPaginatedData(response);
        setCompanies(items);
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const moduleData = buildModuleChart(companies);
  const statusData = buildStatusChart(companies);

  return (
    <div className="dashboard-charts">
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-value">{loading ? '—' : companies.length}</span>
          <span className="stat-label">Total companies</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {loading ? '—' : companies.filter((c) => c.status === 'Active').length}
          </span>
          <span className="stat-label">Active tenants</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {loading ? '—' : companies.filter((c) => c.moduleFlags?.leaveManagement !== false).length}
          </span>
          <span className="stat-label">Leave module enabled</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Tenant Status</h3>
          <div className="chart-container chart-container--compact">
            {loading ? (
              <p className="chart-loading">Loading…</p>
            ) : companies.length === 0 ? (
              <p className="chart-loading">No companies yet. Create one to see charts.</p>
            ) : (
              <Doughnut data={statusData} options={chartDefaults} />
            )}
          </div>
        </div>
        <div className="chart-card">
          <h3>Module Adoption</h3>
          <div className="chart-container">
            {loading ? (
              <p className="chart-loading">Loading…</p>
            ) : companies.length === 0 ? (
              <p className="chart-loading">No companies yet.</p>
            ) : (
              <Bar data={moduleData} options={chartDefaults} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

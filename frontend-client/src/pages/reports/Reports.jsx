import { useCallback, useEffect, useState } from 'react';
import {
  downloadLeaveSummaryCsv,
  fetchLeaveDetailsReport,
  fetchLeaveSummaryReport,
} from '../../api/leaveReportsApi.js';
import EmptyState from '../../components/EmptyState.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { formatDisplayDate } from '../../utils/dateUtils.js';

function numberValue(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(2);
}

export default function Reports() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [report, setReport] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailsPagination, setDetailsPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchLeaveSummaryReport({ year });
      setReport(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load leave report.'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const loadDetails = useCallback(async () => {
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const { items, pagination } = await fetchLeaveDetailsReport({
        year,
        page: 1,
        limit: 20,
        status: statusFilter || undefined,
      });
      setDetails(items);
      setDetailsPagination(pagination);
    } catch (err) {
      setDetailsError(getApiErrorMessage(err, 'Failed to load leave report details.'));
      setDetails([]);
      setDetailsPagination(null);
    } finally {
      setDetailsLoading(false);
    }
  }, [year, statusFilter]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const statusEntries = Object.entries(report?.applications?.byStatus || {});

  async function handleDownloadCsv() {
    setDownloading(true);
    setDownloadError('');

    try {
      await downloadLeaveSummaryCsv({ year });
    } catch (err) {
      setDownloadError(getApiErrorMessage(err, 'Failed to download leave summary CSV.'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Leave Reports</h3>
          <p className="placeholder-text">Yearly leave analytics for applications and ledger utilization.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-btn" onClick={handleDownloadCsv} disabled={downloading}>
            {downloading ? 'Downloading…' : 'Download CSV'}
          </button>
          <label>
            Year
            <input
              type="number"
              min="2000"
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        {loading && <p className="placeholder-text">Loading leave report...</p>}
        {error && <div className="form-error">{error}</div>}
        {downloadError && <div className="form-error">{downloadError}</div>}

        {!loading && !error && !report && (
          <EmptyState title="No report data" message="No leave report data is available for this year." />
        )}

        {!loading && report && (
          <div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="loan-type-summary">
                <p>
                  <strong>Total applications:</strong> {report.applications?.total || 0}
                </p>
                <p>
                  <strong>Ledger rows:</strong> {report.ledger?.balanceRows || 0}
                </p>
              </div>
              <div className="loan-type-summary">
                <p>
                  <strong>Opening:</strong> {numberValue(report.ledger?.openingBalance)}
                </p>
                <p>
                  <strong>Accrued:</strong> {numberValue(report.ledger?.accrued)}
                </p>
                <p>
                  <strong>Availed:</strong> {numberValue(report.ledger?.availed)}
                </p>
                <p>
                  <strong>Closing:</strong> {numberValue(report.ledger?.closingBalance)}
                </p>
              </div>
            </div>

            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {statusEntries.length === 0 && (
                    <tr>
                      <td colSpan={2}>No application statuses found.</td>
                    </tr>
                  )}
                  {statusEntries.map(([status, count]) => (
                    <tr key={status}>
                      <td>{status}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Approved Applications</th>
                    <th>Chargeable Days</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.leaveTypeUtilization || []).length === 0 && (
                    <tr>
                      <td colSpan={3}>No approved leave utilization records for this year.</td>
                    </tr>
                  )}
                  {(report.leaveTypeUtilization || []).map((row) => (
                    <tr key={row.leaveTypeId}>
                      <td>{row.leaveTypeCode ? `${row.leaveTypeCode} - ${row.leaveTypeName}` : '—'}</td>
                      <td>{row.applications}</td>
                      <td>{numberValue(row.chargeableDays)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-header">
          <div>
            <h3>Detailed Applications</h3>
            <p className="placeholder-text">Top 20 applications for selected year/status.</p>
          </div>
        </div>

        {detailsLoading && <p className="placeholder-text">Loading detailed applications...</p>}
        {detailsError && <div className="form-error">{detailsError}</div>}

        {!detailsLoading && !detailsError && details.length === 0 && (
          <EmptyState title="No detailed records" message="No leave applications match this filter." />
        )}

        {!detailsLoading && details.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Chargeable Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {details.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <code>{row.applicationNo || row._id?.slice(-6)}</code>
                    </td>
                    <td>
                      {row.employee?.employeeCode
                        ? `${row.employee.employeeCode}${row.employee.employeeName ? ` - ${row.employee.employeeName}` : ''}`
                        : '—'}
                    </td>
                    <td>{row.leaveType?.code ? `${row.leaveType.code} - ${row.leaveType.name}` : '—'}</td>
                    <td>{row.fromDate ? formatDisplayDate(row.fromDate) : '—'}</td>
                    <td>{row.toDate ? formatDisplayDate(row.toDate) : '—'}</td>
                    <td>{numberValue(row.chargeableDays)}</td>
                    <td>{row.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!detailsLoading && detailsPagination && (
          <p className="placeholder-text" style={{ marginTop: 10 }}>
            Showing {details.length} of {detailsPagination.total} records.
          </p>
        )}
      </div>
    </div>
  );
}

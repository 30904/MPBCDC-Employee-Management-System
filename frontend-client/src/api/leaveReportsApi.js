import apiClient from './apiClient.js';
import { unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLeaveSummaryReport({ year } = {}) {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', String(year));
  }

  const query = params.toString();
  const response = await apiClient.get(`/leave-reports/summary${query ? `?${query}` : ''}`);
  return unwrapApiData(response);
}

export async function downloadLeaveSummaryCsv({ year } = {}) {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', String(year));
  }

  const query = params.toString();
  const response = await apiClient.get(`/leave-reports/summary.csv${query ? `?${query}` : ''}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `leave-summary-${year || 'report'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function fetchLeaveDetailsReport({ year, page = 1, limit = 20, status, leaveTypeId } = {}) {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', String(year));
  }
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (status) {
    params.set('status', status);
  }
  if (leaveTypeId) {
    params.set('leaveTypeId', leaveTypeId);
  }

  const response = await apiClient.get(`/leave-reports/details?${params.toString()}`);
  return unwrapPaginatedData(response);
}

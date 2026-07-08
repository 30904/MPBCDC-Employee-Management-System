import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLeaveTypeOptions() {
  const response = await apiClient.get('/leaves/types');
  return unwrapApiData(response);
}

export async function previewLeaveDays({ leaveTypeId, fromDate, toDate }) {
  const params = new URLSearchParams({
    leaveTypeId,
    fromDate,
    toDate,
  });
  const response = await apiClient.get(`/leaves/preview?${params.toString()}`);
  return unwrapApiData(response);
}

export async function submitLeaveApplication(payload) {
  const response = await apiClient.post('/leaves/apply', payload);
  return unwrapApiData(response);
}

export async function fetchMyLeaveHistory({ page = 1, limit = 50, status } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (status) {
    params.set('status', status);
  }

  const response = await apiClient.get(`/leaves/history?${params.toString()}`);
  return unwrapPaginatedData(response);
}

export async function fetchMyLeaveBalances({ page = 1, limit = 50, period, leaveTypeId } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (period) {
    params.set('period', period);
  }

  if (leaveTypeId) {
    params.set('leaveTypeId', leaveTypeId);
  }

  const response = await apiClient.get(`/leaves/balance?${params.toString()}`);
  return unwrapPaginatedData(response);
}

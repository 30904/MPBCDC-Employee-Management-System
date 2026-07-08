import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLeaveBalances({ page = 1, limit = 100, employeeId, leaveTypeId, period } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (employeeId) {
    params.set('employeeId', employeeId);
  }

  if (leaveTypeId) {
    params.set('leaveTypeId', leaveTypeId);
  }

  if (period) {
    params.set('period', period);
  }

  const response = await apiClient.get(`/leave-balances?${params.toString()}`);
  return unwrapPaginatedData(response);
}

export async function runLeaveYearEndClose(payload) {
  const response = await apiClient.post('/leave-balances/year-end-close', payload);
  return unwrapApiData(response);
}

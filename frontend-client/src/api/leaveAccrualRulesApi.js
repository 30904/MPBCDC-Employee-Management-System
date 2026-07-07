import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLeaveTypeOptionsForAccrual() {
  const response = await apiClient.get('/leave-accrual-rules/leave-type-options');
  return unwrapApiData(response);
}

export async function fetchAccrualRules({ page = 1, limit = 50, status } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (status) {
    params.set('status', status);
  }

  const response = await apiClient.get(`/leave-accrual-rules?${params}`);
  return unwrapPaginatedData(response);
}

export async function createAccrualRule(payload) {
  const response = await apiClient.post('/leave-accrual-rules', payload);
  return unwrapApiData(response);
}

export async function updateAccrualRule(id, payload) {
  const response = await apiClient.put(`/leave-accrual-rules/${id}`, payload);
  return unwrapApiData(response);
}

export async function deleteAccrualRule(id) {
  const response = await apiClient.delete(`/leave-accrual-rules/${id}`);
  return unwrapApiData(response);
}

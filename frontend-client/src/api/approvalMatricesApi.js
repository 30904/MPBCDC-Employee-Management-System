import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchApprovalMatrices({ module = 'LOAN', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));
  if (module) {
    params.set('module', module);
  }
  const response = await apiClient.get(`/approval-matrices?${params}`);
  return unwrapPaginatedData(response);
}

export async function createApprovalMatrix(payload) {
  const response = await apiClient.post('/approval-matrices', payload);
  return unwrapApiData(response);
}

export async function updateApprovalMatrix(id, payload) {
  const response = await apiClient.put(`/approval-matrices/${id}`, payload);
  return unwrapApiData(response);
}

export async function deleteApprovalMatrix(id) {
  const response = await apiClient.delete(`/approval-matrices/${id}`);
  return unwrapApiData(response);
}

export async function initializeLoanApprovalMatrix() {
  const response = await apiClient.post('/approval-matrices/initialize-loan-default');
  return unwrapApiData(response);
}

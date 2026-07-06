import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLoanTypes({ page = 1, limit = 50, isActive } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (isActive !== undefined) {
    params.set('isActive', String(isActive));
  }

  const response = await apiClient.get(`/loan-types?${params}`);
  return unwrapPaginatedData(response);
}

export async function createLoanType(payload) {
  const response = await apiClient.post('/loan-types', payload);
  return unwrapApiData(response);
}

export async function updateLoanType(id, payload) {
  const response = await apiClient.put(`/loan-types/${id}`, payload);
  return unwrapApiData(response);
}

export async function deleteLoanType(id) {
  const response = await apiClient.delete(`/loan-types/${id}`);
  return unwrapApiData(response);
}

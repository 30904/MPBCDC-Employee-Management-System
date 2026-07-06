import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchEligibilityRules({ page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));
  const response = await apiClient.get(`/loan-eligibility-rules?${params}`);
  return unwrapPaginatedData(response);
}

export async function createEligibilityRule(payload) {
  const response = await apiClient.post('/loan-eligibility-rules', payload);
  return unwrapApiData(response);
}

export async function updateEligibilityRule(id, payload) {
  const response = await apiClient.put(`/loan-eligibility-rules/${id}`, payload);
  return unwrapApiData(response);
}

export async function deleteEligibilityRule(id) {
  const response = await apiClient.delete(`/loan-eligibility-rules/${id}`);
  return unwrapApiData(response);
}

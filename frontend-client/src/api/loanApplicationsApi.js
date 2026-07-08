import apiClient from './apiClient.js';
import { unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLoanApprovalQueue() {
  const response = await apiClient.get('/loan-applications/queue');
  return unwrapApiData(response);
}

export async function recordLoanApprovalDecision(applicationId, payload) {
  const response = await apiClient.post(`/loan-applications/${applicationId}/decision`, payload);
  return unwrapApiData(response);
}

export async function fetchLoanApplications(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);

  const query = search.toString();
  const response = await apiClient.get(`/loan-applications${query ? `?${query}` : ''}`);
  return unwrapPaginatedData(response);
}

export async function fetchLoanApplication(applicationId) {
  const response = await apiClient.get(`/loan-applications/${applicationId}`);
  return unwrapApiData(response);
}
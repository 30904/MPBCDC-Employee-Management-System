import apiClient from './apiClient.js';
import { unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchPendingDisbursements() {
  const response = await apiClient.get('/loan-disbursements/pending');
  return unwrapApiData(response);
}

export async function fetchDisbursements(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  const response = await apiClient.get(`/loan-disbursements${query ? `?${query}` : ''}`);
  return unwrapPaginatedData(response);
}

export async function disburseLoanApplication(payload) {
  const response = await apiClient.post('/loan-disbursements', payload);
  return unwrapApiData(response);
}

export async function fetchLoanSchedule(applicationId) {
  const response = await apiClient.get(`/loan-disbursements/schedule/${applicationId}`);
  return unwrapApiData(response);
}

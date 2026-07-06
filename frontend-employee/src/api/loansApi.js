import apiClient from './apiClient.js';
import { unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchActiveLoanTypes() {
  const response = await apiClient.get('/loans/types');
  return unwrapApiData(response);
}

export async function previewLoanEligibility({ loanTypeId, requestedAmount, requestedTenure }) {
  const params = new URLSearchParams({
    loanTypeId,
    requestedAmount: String(requestedAmount),
    requestedTenure: String(requestedTenure),
  });
  const response = await apiClient.get(`/loans/preview-eligibility?${params}`);
  return unwrapApiData(response);
}

export async function submitLoanApplication(payload) {
  const response = await apiClient.post('/loans/apply', payload);
  return unwrapApiData(response);
}

export async function fetchMyLoanApplications(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);

  const query = search.toString();
  const response = await apiClient.get(`/loan-applications/mine${query ? `?${query}` : ''}`);
  return unwrapPaginatedData(response);
}

export async function fetchLoanRepaymentSchedule(applicationId) {
  const response = await apiClient.get(`/loans/${applicationId}/schedule`);
  return unwrapApiData(response);
}

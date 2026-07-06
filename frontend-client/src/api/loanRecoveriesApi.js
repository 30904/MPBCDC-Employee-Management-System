import apiClient from './apiClient.js';
import { unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchPendingRecoveries(payrollMonth) {
  const params = new URLSearchParams({ payrollMonth });
  const response = await apiClient.get(`/loan-recoveries/pending?${params}`);
  return unwrapApiData(response);
}

export async function fetchRecoveries(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.payrollMonth) search.set('payrollMonth', params.payrollMonth);
  if (params.loanNo) search.set('loanNo', params.loanNo);
  if (params.status) search.set('status', params.status);

  const query = search.toString();
  const response = await apiClient.get(`/loan-recoveries${query ? `?${query}` : ''}`);
  return unwrapPaginatedData(response);
}

export async function recordLoanRecovery(payload) {
  const response = await apiClient.post('/loan-recoveries', payload);
  return unwrapApiData(response);
}

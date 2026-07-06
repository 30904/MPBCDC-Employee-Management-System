import apiClient from './apiClient.js';
import { unwrapApiData } from './response.js';

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

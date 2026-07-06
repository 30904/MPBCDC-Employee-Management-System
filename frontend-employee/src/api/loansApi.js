import apiClient from './apiClient.js';
import { unwrapApiData } from './response.js';

export async function fetchActiveLoanTypes() {
  const response = await apiClient.get('/loans/types');
  return unwrapApiData(response);
}

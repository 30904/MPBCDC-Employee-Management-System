import apiClient from './apiClient.js';

function unwrap(responseData) {
  return responseData?.data ?? responseData;
}

export async function fetchCompanies() {
  const { data } = await apiClient.get('/companies');
  return unwrap(data);
}

export async function fetchCompany(companyId) {
  const { data } = await apiClient.get(`/companies/${companyId}`);
  return unwrap(data);
}

export async function createCompany(payload) {
  const { data } = await apiClient.post('/companies', payload);
  return unwrap(data);
}

export async function updateCompany(companyId, payload) {
  const { data } = await apiClient.put(`/companies/${companyId}`, payload);
  return unwrap(data);
}

export async function fetchCompanyUsers(companyId) {
  const { data } = await apiClient.get(`/companies/${companyId}/users`);
  return unwrap(data);
}

export async function createCompanyUser(companyId, payload) {
  const { data } = await apiClient.post(`/companies/${companyId}/users`, payload);
  return unwrap(data);
}

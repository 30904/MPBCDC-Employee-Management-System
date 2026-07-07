import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLeaveTypes({ page = 1, limit = 50, isActive } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (isActive !== undefined) {
    params.set('isActive', String(isActive));
  }

  const response = await apiClient.get(`/leave-types?${params}`);
  return unwrapPaginatedData(response);
}

export async function createLeaveType(payload) {
  const response = await apiClient.post('/leave-types', payload);
  return unwrapApiData(response);
}

export async function updateLeaveType(id, payload) {
  const response = await apiClient.put(`/leave-types/${id}`, payload);
  return unwrapApiData(response);
}

export async function deleteLeaveType(id) {
  const response = await apiClient.delete(`/leave-types/${id}`);
  return unwrapApiData(response);
}

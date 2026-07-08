import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchLeaveApprovalQueue() {
  const response = await apiClient.get('/leave-applications/queue');
  return unwrapApiData(response);
}

export async function recordLeaveApprovalDecision(applicationId, payload) {
  const response = await apiClient.post(`/leave-applications/${applicationId}/decision`, payload);
  return unwrapApiData(response);
}

export async function fetchLeaveApplications({
  page = 1,
  limit = 100,
  status,
  employeeId,
  leaveTypeId,
} = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (status) {
    params.set('status', status);
  }

  if (employeeId) {
    params.set('employeeId', employeeId);
  }

  if (leaveTypeId) {
    params.set('leaveTypeId', leaveTypeId);
  }

  const response = await apiClient.get(`/leave-applications?${params.toString()}`);
  return unwrapPaginatedData(response);
}

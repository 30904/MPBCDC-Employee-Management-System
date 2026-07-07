import apiClient from './apiClient.js';
import { buildPaginationQuery, unwrapApiData, unwrapPaginatedData } from './response.js';

export async function fetchHolidayRegionOptions() {
  const response = await apiClient.get('/holidays/region-options');
  return unwrapApiData(response);
}

export async function fetchHolidays({ page = 1, limit = 100, year, holidayType, regionId, isActive } = {}) {
  const params = new URLSearchParams(buildPaginationQuery({ page, limit }));

  if (year !== undefined) {
    params.set('year', String(year));
  }

  if (holidayType) {
    params.set('holidayType', holidayType);
  }

  if (regionId) {
    params.set('regionId', regionId);
  }

  if (isActive !== undefined) {
    params.set('isActive', String(isActive));
  }

  const response = await apiClient.get(`/holidays?${params}`);
  return unwrapPaginatedData(response);
}

export async function createHoliday(payload) {
  const response = await apiClient.post('/holidays', payload);
  return unwrapApiData(response);
}

export async function updateHoliday(id, payload) {
  const response = await apiClient.put(`/holidays/${id}`, payload);
  return unwrapApiData(response);
}

export async function deleteHoliday(id) {
  const response = await apiClient.delete(`/holidays/${id}`);
  return unwrapApiData(response);
}

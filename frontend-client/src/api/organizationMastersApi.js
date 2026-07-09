import apiClient from './apiClient.js';
import { unwrapApiData } from './response.js';

function isActiveRecord(record) {
  return String(record?.status || '').toLowerCase() === 'active';
}

async function fetchMasterRecords(path, { activeOnly = true } = {}) {
  const response = await apiClient.get(path);
  const records = unwrapApiData(response);

  if (!Array.isArray(records)) {
    return [];
  }

  return activeOnly ? records.filter(isActiveRecord) : records;
}

export function fetchDepartments(options) {
  return fetchMasterRecords('/departments', options);
}

export function fetchDesignations(options) {
  return fetchMasterRecords('/designations', options);
}

export function fetchGrades(options) {
  return fetchMasterRecords('/grades', options);
}

export function fetchRegions(options) {
  return fetchMasterRecords('/regions', options);
}

export function fetchDistricts(options) {
  return fetchMasterRecords('/districts', options);
}

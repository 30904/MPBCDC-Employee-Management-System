import axios from 'axios';
import { API_BASE_PATH } from './config.js';
import { getApiErrorMessage, isApiError } from './response.js';
import { TENANT_HEADER } from '../constants/authStorage.js';
import { clearAuth, getSelectedCompanyId, getToken } from '../utils/auth.js';
import { stripCompanyIdFromAxiosConfig } from '../utils/stripCompanyId.js';

const apiClient = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const selectedCompanyId = getSelectedCompanyId();
  if (selectedCompanyId) {
    config.headers[TENANT_HEADER] = selectedCompanyId;
  }

  stripCompanyIdFromAxiosConfig(config);

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response?.data && isApiError(response.data)) {
      return Promise.reject(new Error(response.data.error || 'Request failed'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message = getApiErrorMessage(error);
    error.apiMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;

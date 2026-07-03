import axios from 'axios';
import { TENANT_HEADER } from '../constants/authStorage.js';
import { clearAuth, getSelectedCompanyId, getToken } from '../utils/auth.js';
import { stripCompanyIdFromAxiosConfig } from '../utils/stripCompanyId.js';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

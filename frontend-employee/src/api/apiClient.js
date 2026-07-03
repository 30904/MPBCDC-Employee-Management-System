import axios from 'axios';
import { clearAuth, getToken } from '../utils/auth.js';
import { stripCompanyIdFromAxiosConfig } from '../utils/stripCompanyId.js';

/**
 * ESS API client — Bearer token only for tenant context (JWT companyId).
 * Does not send x-company-id; companyId is never included in request bodies.
 */
const apiClient = axios.create({  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

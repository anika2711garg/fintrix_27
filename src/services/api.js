import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const normalizedBaseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '';
const apiBaseUrl = normalizedBaseUrl
  ? (normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const recordService = {
  getAll: (params) => api.get('/records', { params }),
  getOne: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getInsights: () => api.get('/dashboard/insights'),
};

export const userService = {
  getAll: () => api.get('/auth/users'),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
};

export default api;


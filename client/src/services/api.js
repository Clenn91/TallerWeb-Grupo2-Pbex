import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si es FormData, no establecer Content-Type (dejar que el navegador lo haga automáticamente)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const qualityAPI = {
  createProductionRecord: (data) => api.post('/quality/production-records', data),
  getProductionRecords: (params) => api.get('/quality/production-records', { params }),
  createQualityControl: (data) => api.post('/quality/quality-controls', data),
  getQualityControls: (params) => api.get('/quality/quality-controls', { params }),
};

export const certificateAPI = {
  create: (data) => api.post('/certificates', data),
  getAll: (params) => api.get('/certificates', { params }),
  getById: (id) => api.get(`/certificates/${id}`),
  approve: (id) => api.patch(`/certificates/${id}/approve`),
  reject: (id, reason) => api.patch(`/certificates/${id}/reject`, { rejectionReason: reason }),
};

export const dashboardAPI = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getTrends: (params) => api.get('/dashboard/trends', { params }),
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  resolve: (id, notes) => api.patch(`/alerts/${id}/resolve`, { resolutionNotes: notes }),
  dismiss: (id) => api.patch(`/alerts/${id}/dismiss`),
};

export const nonConformityAPI = {
  create: (data) => api.post('/non-conformities', data),
  getAll: (params) => api.get('/non-conformities', { params }),
  resolve: (id, action) => api.patch(`/non-conformities/${id}/resolve`, { correctiveAction: action }),
  updateStatus: (id, status) => api.patch(`/non-conformities/${id}/status`, { status }),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updatePassword: (id, newPassword) => api.patch(`/users/${id}/password`, { newPassword }),
};

export default api;


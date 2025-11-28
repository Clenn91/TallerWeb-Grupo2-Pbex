import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si es FormData, no establecer Content-Type (dejar que el navegador lo haga automáticamente)
    if (config.data instanceof FormData && config.headers) {
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

interface LoginResponse {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  register: (data: RegisterData) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const qualityAPI = {
  createProductionRecord: (data: any) => api.post('/quality/production-records', data),
  getProductionRecords: (params?: any) => api.get('/quality/production-records', { params }),
  createQualityControl: (data: any) => api.post('/quality/quality-controls', data),
  getQualityControls: (params?: any) => api.get('/quality/quality-controls', { params }),
};

export const certificateAPI = {
  create: (data: any) => api.post('/certificates', data),
  getAll: (params?: any) => api.get('/certificates', { params }),
  getById: (id: number) => api.get(`/certificates/${id}`),
  approve: (id: number) => api.patch(`/certificates/${id}/approve`),
  reject: (id: number, reason: string) => api.patch(`/certificates/${id}/reject`, { rejectionReason: reason }),
};

export const dashboardAPI = {
  getMetrics: (params?: any) => api.get('/dashboard/metrics', { params }),
  getTrends: (params?: any) => api.get('/dashboard/trends', { params }),
};

export const alertAPI = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  resolve: (id: number, notes: string) => api.patch(`/alerts/${id}/resolve`, { resolutionNotes: notes }),
  dismiss: (id: number) => api.patch(`/alerts/${id}/dismiss`),
};

export const nonConformityAPI = {
  create: (data: any) => api.post('/non-conformities', data),
  getAll: (params?: any) => api.get('/non-conformities', { params }),
  resolve: (id: number, action: string) => api.patch(`/non-conformities/${id}/resolve`, { correctiveAction: action }),
  updateStatus: (id: number, status: string) => api.patch(`/non-conformities/${id}/status`, { status }),
};

export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const userAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  updatePassword: (id: number, newPassword: string) => api.patch(`/users/${id}/password`, { newPassword }),
};

export default api;


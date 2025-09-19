import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string, role: string) =>
    api.post('/auth/register', { username, password, role }),
};

export const bookingAPI = {
  getBookings: () => api.get('/bookings'),
  createBooking: (booking: any) => api.post('/bookings', booking),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const adminAPI = {
  getPickups: () => api.get('/admin/pickups'),
  getDeliveryGuys: () => api.get('/admin/delivery-guys'),
  assignDelivery: (bookingId: number, deliveryGuyId: number) =>
    api.post('/admin/assign-delivery', { booking_id: bookingId, delivery_guy_id: deliveryGuyId }),
  scheduleRoutes: (k: number = 3) => api.post(`/schedule_routes?k=${k}`),
};

export const deliveryAPI = {
  getAssignments: () => api.get('/delivery/assignments'),
  updateStatus: (bookingId: number, status: string) =>
    api.post(`/delivery/update-status?booking_id=${bookingId}&status=${status}`),
};

export const pointsAPI = {
  getBalance: () => api.get('/points/balance'),
  getHistory: () => api.get('/points/history'),
  redeemPoints: (points: number) => api.post('/points/redeem', { points_to_redeem: points }),
};

export const routesAPI = {
  getRoutes: () => api.get('/routes'),
};

export const aiAPI = {
  classifyImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ai/classify-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  checkHealth: () => api.get('/ai/health'),
};

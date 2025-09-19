import axios from 'axios';
import { withCaching } from '../hooks/useAPICache';

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000, // 10 second timeout
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cached API functions with different TTLs based on data volatility
export const optimizedAPI = {
  // Dashboard data - cache for 30 seconds
  getDashboard: withCaching(
    () => api.get('/dashboard'),
    () => 'dashboard',
    { ttl: 30000 }
  ),

  // Bookings - cache for 10 seconds (more volatile)
  getBookings: withCaching(
    () => api.get('/bookings'),
    () => 'bookings',
    { ttl: 10000 }
  ),

  // Routes - cache for 60 seconds (less volatile)
  getRoutes: withCaching(
    () => api.get('/routes'),
    () => 'routes',
    { ttl: 60000 }
  ),

  // Points balance - cache for 15 seconds
  getPointsBalance: withCaching(
    () => api.get('/points/balance'),
    () => 'points_balance',
    { ttl: 15000 }
  ),

  // Points history - cache for 30 seconds
  getPointsHistory: withCaching(
    () => api.get('/points/history'),
    () => 'points_history',
    { ttl: 30000 }
  ),

  // Admin pickups - cache for 10 seconds
  getPickups: withCaching(
    () => api.get('/admin/pickups'),
    () => 'admin_pickups',
    { ttl: 10000 }
  ),

  // Delivery guys - cache for 60 seconds (rarely changes)
  getDeliveryGuys: withCaching(
    () => api.get('/admin/delivery-guys'),
    () => 'delivery_guys',
    { ttl: 60000 }
  ),

  // Delivery assignments - cache for 15 seconds
  getAssignments: withCaching(
    () => api.get('/delivery/assignments'),
    () => 'delivery_assignments',
    { ttl: 15000 }
  ),

  // Non-cached functions (mutations)
  createBooking: (booking: any) => api.post('/bookings', booking),
  updateStatus: (id: number, status: string) => api.put(`/delivery/assignments/${id}/status`, { status }),
  assignDelivery: (bookingId: number, deliveryGuyId: number) => 
    api.post('/admin/assign-delivery', { booking_id: bookingId, delivery_guy_id: deliveryGuyId }),
  scheduleRoutes: (k: number) => api.post('/schedule_routes', {}, { params: { k } }),
  redeemPoints: (amount: number) => api.post('/points/redeem', { amount }),
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  classifyImage: (imageData: FormData) => api.post('/classify_image', imageData),
};

// Cache management utilities
export const cacheUtils = {
  // Clear all caches
  clearAll: () => {
    // This would need to be implemented with a global cache manager
    console.log('🧹 Clearing all API caches');
  },

  // Clear specific cache
  clearCache: (key: string) => {
    console.log(`🧹 Clearing cache for key: ${key}`);
  },

  // Get cache statistics
  getCacheStats: () => {
    console.log('📊 Cache statistics would be available here');
    return {
      totalCaches: 0,
      hitRate: 0,
      memoryUsage: 0
    };
  }
};

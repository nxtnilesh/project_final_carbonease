import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// Credits API
export const creditsAPI = {
  getCredits: (params = {}) => api.get('/credits', { params }),
  getCredit: (id) => api.get(`/credits/${id}`),
  createCredit: (creditData) => api.post('/credits', creditData),
  updateCredit: (id, creditData) => api.put(`/credits/${id}`, creditData),
  deleteCredit: (id) => api.delete(`/credits/${id}`),
  getMyCredits: (params = {}) => api.get('/credits/seller/my-credits', { params }),
  getSellerStats: () => api.get('/credits/seller/stats'),
  getEnergyTypes: () => api.get('/credits/energy-types'),
  getCertificationStandards: () => api.get('/credits/certification-standards'),
  getCountries: () => api.get('/credits/countries'),
  verifyCredit: (id) => api.put(`/credits/${id}/verify`),
};

// Transactions API
export const transactionsAPI = {
  createTransaction: (transactionData) => api.post('/transactions', transactionData),
  getTransactions: (params = {}) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  updateTransactionStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
  addReview: (id, reviewData) => api.post(`/transactions/${id}/review`, reviewData),
  getTransactionStats: () => api.get('/transactions/stats'),
  cancelTransaction: (id, reason) => api.put(`/transactions/${id}/cancel`, { reason }),
  downloadCertificate: (id, certId) => api.get(`/transactions/${id}/certificate/${certId}`),
};

// Payments API
export const paymentsAPI = {
  createCheckoutSession: (transactionId) => api.post('/payments/create-checkout-session', { transactionId }),
  getPaymentStatus: (transactionId) => api.get(`/payments/status/${transactionId}`),
  processRefund: (refundData) => api.post('/payments/refund', refundData),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const isApiError = (error) => {
  return error.response?.status >= 400;
};

export default api;

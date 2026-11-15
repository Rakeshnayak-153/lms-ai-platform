import axios from 'axios';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'https://lms-ai-backend-f3p3.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

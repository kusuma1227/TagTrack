import axios from 'axios';

/**
 * Resolve the API base URL based on environment variables and deployment context.
 * - If VITE_API_URL is provided, use it (handles trailing slashes / subpaths).
 * - If running locally (localhost / 127.0.0.1), always use relative '/api/v1' to route to the local backend.
 * - In cloud production (e.g. Vercel), default to the cloud backend.
 */
const getBaseURL = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    const clean = envApiUrl.replace(/\/$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  // If running in a browser on localhost, always talk to the local backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api/v1';
    }
  }

  // Cloud production default (e.g. deployed on Vercel)
  if (import.meta.env.PROD) {
    return 'https://tagtrack-5a55.onrender.com/api/v1';
  }

  return '/api/v1';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tagtrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 on an authenticated resource, clear session and redirect to /login
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');

      // Do not perform redirect on explicit login / register attempts so components can show errors
      if (!isAuthAttempt) {
        localStorage.removeItem('tagtrack_token');
        localStorage.removeItem('tagtrack_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

/**
 * Axios instance pre-configured for the TagTrack API.
 *
 * - baseURL: /api/v1 (proxied to http://localhost:5000 in dev via Vite config)
 * - Request interceptor: automatically attaches JWT from localStorage
 * - Response interceptor: on 401, clears token and redirects to /login
 */
/**
 * Resolve the API base URL based on environment variables and deployment context.
 * - If VITE_API_URL is provided, use it (handles trailing slashes / subpaths).
 * - In production (e.g. Vercel), default to the Render backend.
 * - In development, default to relative '/api/v1' to utilize Vite's dev proxy.
 */
const getBaseURL = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    const clean = envApiUrl.replace(/\/$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }
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
  withCredentials: true,
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

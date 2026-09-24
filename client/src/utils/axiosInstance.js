import axios from 'axios';

/**
 * Axios instance pre-configured for the TagTrack API.
 *
 * - baseURL: /api/v1 (proxied to http://localhost:5000 in dev via Vite config)
 * - Request interceptor: automatically attaches JWT from localStorage
 * - Response interceptor: on 401, clears token and redirects to /login
 */
const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
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
    // If the server returns 401, the token is invalid or expired
    if (error.response?.status === 401) {
      localStorage.removeItem('tagtrack_token');
      localStorage.removeItem('tagtrack_user');
      // Redirect to login only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

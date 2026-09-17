import axios from 'axios';
import { store } from '../app/store.js';
import { setAccessToken, logoutLocal } from '../features/auth/authSlice.js';

/**
 * VisionHR backend does NOT put the access token in a cookie.
 * - Access token: returned in the JSON body on /auth/login, kept in memory
 *   (Redux), attached manually via the Authorization header below.
 * - Refresh token: HttpOnly cookie, scoped to /api/v1/auth by the backend
 *   (Set-Cookie ... Path=/api/v1/auth). withCredentials must be true so the
 *   browser sends it automatically on calls to /auth/refresh and /auth/logout.
 *
 * This is more secure than a plain cookie-based access token (keeps the
 * bearer token out of document.cookie / dev tools network tab replay),
 * but it means the frontend must re-hydrate the access token on every
 * full page load via a silent /auth/refresh call — see bootstrapAuth().
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // sends the visionhr_refresh cookie on /auth/* calls
  headers: { 'Content-Type': 'application/json' },
});

// ---- Attach access token from Redux state on every request ----
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Queue concurrent requests while a refresh is in-flight ----
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Never try to refresh the refresh call itself, or the login call
    const isAuthRoute =
      originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        store.dispatch(setAccessToken(newToken));
        flushQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        store.dispatch(logoutLocal());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const formatBaseURL = (rawUrl) => {
  if (!rawUrl) return '/api/v1';
  const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api/v1')) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
};

const api = axios.create({
  baseURL: formatBaseURL(import.meta.env.VITE_API_URL),
  withCredentials: true, // Send httpOnly cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Access Token if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for 401 Silent Refresh and Error Normalization
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Standardize error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    error.normalizedMessage = message;

    // Skip retry logic for auth routes (login, register, google, resend-verification, forgot/reset password, refresh-token itself)
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/google') ||
      originalRequest.url?.includes('/auth/resend-verification') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await api.post('/auth/refresh-token', {
          refreshToken: storedRefreshToken,
        });

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

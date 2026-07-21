import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Necessary to send the HttpOnly refresh token cookie
});

let accessToken = '';

/**
 * Stores the active access token in memory.
 * @param {string} token Bearer access token
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

// Request Interceptor: inject Bearer Token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Extracts normalized error messages from standard API responses.
 * @param {Error} error Axios Error Object
 * @returns {string} User-friendly message
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'A network error occurred. Please check your connection.';
};

export default api;

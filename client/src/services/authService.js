import api, { setAccessToken } from './api';

/**
 * Registers a new Student.
 * @param {string} fullName 
 * @param {string} email 
 * @param {string} password 
 */
export const register = async (fullName, email, password) => {
  const response = await api.post('/auth/register', { fullName, email, password });
  return response.data;
};

/**
 * Log in a user.
 * @param {string} email 
 * @param {string} password 
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  // Store the access token in memory
  if (response.data.success && response.data.data.accessToken) {
    setAccessToken(response.data.data.accessToken);
  }
  return response.data;
};

/**
 * Log out the active session.
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  // Clear token in memory
  setAccessToken('');
  return response.data;
};

/**
 * Rotates the Access Token using the HttpOnly Refresh cookie.
 */
export const refresh = async () => {
  const response = await api.post('/auth/refresh');
  if (response.data.success && response.data.data.accessToken) {
    setAccessToken(response.data.data.accessToken);
  }
  return response.data;
};

/**
 * Fetches the logged-in user profile context.
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

import api from './api';

/**
 * Retrieves master admin dashboard analytics data.
 */
export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

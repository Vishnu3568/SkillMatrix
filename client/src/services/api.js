import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

// Helper to manage mock demo user state for static hosts (GitHub Pages)
const getMockUser = () => {
  const stored = localStorage.getItem('skillmatrix_demo_user');
  return stored ? JSON.parse(stored) : null;
};

const setMockUser = (user) => {
  if (user) {
    localStorage.setItem('skillmatrix_demo_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('skillmatrix_demo_user');
  }
};

// Response Interceptor: Fallback to static demo handler when API returns 405 (Static GitHub Pages Host)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 405) {
      const { config } = error;
      const url = config?.url || '';
      const method = (config?.method || 'get').toLowerCase();

      // Mock Registration
      if (url.includes('/auth/register') && method === 'post') {
        const body = JSON.parse(config.data || '{}');
        const user = {
          _id: 'demo-user-' + Date.now(),
          name: body.name || 'Demo Student',
          email: body.email || 'student@skillmatrix.com',
          role: 'student',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setMockUser(user);
        setAccessToken('demo-access-token-xyz');
        return Promise.resolve({
          data: {
            success: true,
            message: 'Account created successfully (Demo Mode)',
            data: { user, accessToken: 'demo-access-token-xyz' },
          },
        });
      }

      // Mock Login
      if (url.includes('/auth/login') && method === 'post') {
        const body = JSON.parse(config.data || '{}');
        const existing = getMockUser();
        const user = existing || {
          _id: 'demo-user-1',
          name: body.email ? body.email.split('@')[0] : 'Demo User',
          email: body.email || 'student@skillmatrix.com',
          role: body.email?.includes('admin') ? 'admin' : 'student',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setMockUser(user);
        setAccessToken('demo-access-token-xyz');
        return Promise.resolve({
          data: {
            success: true,
            message: 'Login successful (Demo Mode)',
            data: { user, accessToken: 'demo-access-token-xyz' },
          },
        });
      }

      // Mock Profile / Current User
      if (url.includes('/auth/me') && method === 'get') {
        const user = getMockUser() || {
          _id: 'demo-user-1',
          name: 'Demo Student',
          email: 'student@skillmatrix.com',
          role: 'student',
          isActive: true,
        };
        return Promise.resolve({ data: { success: true, data: { user } } });
      }

      // Mock Token Refresh
      if (url.includes('/auth/refresh')) {
        const user = getMockUser();
        if (!user) return Promise.reject(error);
        setAccessToken('demo-access-token-xyz');
        return Promise.resolve({
          data: { success: true, data: { accessToken: 'demo-access-token-xyz' } },
        });
      }

      // Mock Logout
      if (url.includes('/auth/logout')) {
        setMockUser(null);
        setAccessToken('');
        return Promise.resolve({ data: { success: true, message: 'Logged out' } });
      }

      // Mock Courses Catalog / Details
      if (url.includes('/courses')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              courses: [
                {
                  _id: 'c1',
                  title: 'Full-Stack MERN Architecture Masterclass',
                  slug: 'fullstack-mern-masterclass',
                  description: 'Learn to build scalable enterprise web applications.',
                  level: 'intermediate',
                  category: 'Web Development',
                  published: true,
                  lessonsCount: 12,
                },
                {
                  _id: 'c2',
                  title: 'Docker & Kubernetes Production Deployment',
                  slug: 'docker-kubernetes-deployment',
                  description: 'Master containerization, CI/CD pipelines, and cloud ops.',
                  level: 'advanced',
                  category: 'DevOps',
                  published: true,
                  lessonsCount: 8,
                },
              ],
              pagination: { total: 2, page: 1, pages: 1 },
            },
          },
        });
      }

      // Mock Dashboard Analytics
      if (url.includes('/dashboard')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              overview: { totalStudents: 154, totalCourses: 12, activeEnrollments: 320, completionRate: 88 },
              recentActivity: [],
            },
          },
        });
      }
    }
    return Promise.reject(error);
  }
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

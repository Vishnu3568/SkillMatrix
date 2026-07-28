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

const MOCK_COURSES = [
  {
    _id: 'c1',
    title: 'Full-Stack MERN Architecture Masterclass',
    slug: 'fullstack-mern-masterclass',
    description: 'Learn to build scalable enterprise web applications with Node.js, Express, React, and MongoDB.',
    level: 'intermediate',
    category: 'Web Development',
    published: true,
    lessonsCount: 12,
    instructorName: 'Vishnu Vardhan',
    thumbnailUrl: '',
    stats: { enrollmentCount: 1420, averageRating: 4.9, completionRate: 92 },
  },
  {
    _id: 'c2',
    title: 'Docker & Kubernetes Production Deployment',
    slug: 'docker-kubernetes-deployment',
    description: 'Master containerization, microservices orchestration, CI/CD pipelines, and cloud ops.',
    level: 'advanced',
    category: 'DevOps',
    published: true,
    lessonsCount: 10,
    instructorName: 'DevOps Architect',
    thumbnailUrl: '',
    stats: { enrollmentCount: 980, averageRating: 4.8, completionRate: 88 },
  },
  {
    _id: 'c3',
    title: 'React 18 & Modern Web Performance',
    slug: 'react-18-performance',
    description: 'Deep dive into concurrent rendering, state management, custom hooks, and memoization.',
    level: 'beginner',
    category: 'Web Development',
    published: true,
    lessonsCount: 8,
    instructorName: 'Frontend Specialist',
    thumbnailUrl: '',
    stats: { enrollmentCount: 1850, averageRating: 4.9, completionRate: 95 },
  },
  {
    _id: 'c4',
    title: 'Cross-Platform React Native App Development',
    slug: 'react-native-mobile-apps',
    description: 'Build native iOS and Android mobile apps with React Native, Expo, and state management.',
    level: 'beginner',
    category: 'Mobile Development',
    published: true,
    lessonsCount: 14,
    instructorName: 'Mobile App Lead',
    thumbnailUrl: '',
    stats: { enrollmentCount: 1120, averageRating: 4.7, completionRate: 86 },
  },
];

// Response Interceptor: Fallback to static demo handler when API returns 404/405 (GitHub Pages Host)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isStaticHostError = !error.response || error.response.status === 404 || error.response.status === 405;

    if (isStaticHostError) {
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

      // Mock Popular / Recommended / Recent Learning
      if (url.includes('/courses/popular') || url.includes('/courses/recommended')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { courses: MOCK_COURSES.slice(0, 3) },
          },
        });
      }

      if (url.includes('/courses/recent-learning') || url.includes('/my-learning')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              enrollments: [
                {
                  _id: 'en-1',
                  course: MOCK_COURSES[0],
                  progressPercentage: 45,
                  completedLessons: ['l1', 'l2'],
                  updatedAt: new Date().toISOString(),
                },
              ],
              courses: MOCK_COURSES.slice(0, 2),
            },
          },
        });
      }

      // Mock Course Catalog & Single Course Details
      if (url.includes('/courses')) {
        const urlObj = new URL(url, 'http://localhost');
        const path = urlObj.pathname;
        const category = urlObj.searchParams.get('category');
        const level = urlObj.searchParams.get('level');
        const search = urlObj.searchParams.get('search');

        // Check if single course request: /courses/:slug
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length >= 2 && pathSegments[pathSegments.length - 2] === 'courses') {
          const slug = pathSegments[pathSegments.length - 1];
          const course = MOCK_COURSES.find((c) => c.slug === slug || c._id === slug) || MOCK_COURSES[0];
          return Promise.resolve({
            data: {
              success: true,
              data: {
                course: {
                  ...course,
                  lessons: [
                    { _id: 'l1', title: '01. Architecture Overview & System Setup', duration: '12:45', slug: 'lesson-1', isFree: true },
                    { _id: 'l2', title: '02. Express Middleware & Security Hardening', duration: '18:20', slug: 'lesson-2', isFree: false },
                    { _id: 'l3', title: '03. Mongoose Schema Projections & Indexing', duration: '22:10', slug: 'lesson-3', isFree: false },
                  ],
                },
              },
            },
          });
        }

        // List courses with filtering support
        let filtered = [...MOCK_COURSES];
        if (category) {
          filtered = filtered.filter((c) => c.category.toLowerCase() === category.toLowerCase());
        }
        if (level) {
          filtered = filtered.filter((c) => c.level.toLowerCase() === level.toLowerCase());
        }
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
        }

        // If filter returned 0 items, fallback to all mock courses so user is never stranded
        const resultCourses = filtered.length > 0 ? filtered : MOCK_COURSES;

        return Promise.resolve({
          data: {
            success: true,
            data: {
              courses: resultCourses,
              pagination: { total: resultCourses.length, page: 1, pages: 1 },
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
              recentActivity: [
                { _id: 'a1', title: 'New Student Registered', time: '10 mins ago' },
                { _id: 'a2', title: 'Completed Lesson 02 in MERN Masterclass', time: '1 hour ago' },
              ],
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

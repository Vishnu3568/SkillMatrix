import api from './api';

/**
 * Enrolls current student into a published course.
 * @param {string} courseId Course database ID
 */
export const enrollInCourse = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/enroll`);
  return response.data;
};

/**
 * Checks if current user is enrolled in a specific course.
 * @param {string} courseId Course database ID
 */
export const getEnrollmentStatus = async (courseId) => {
  const response = await api.get(`/enrollments/${courseId}/status`);
  return response.data;
};

/**
 * Lists current student's enrolled courses for the "My Learning" portal.
 * @param {Object} params { search, page, limit }
 */
export const getMyLearning = async (params) => {
  const response = await api.get('/my-learning', { params });
  return response.data;
};

/**
 * Cancels current student's active enrollment in a course.
 * @param {string} courseId Course database ID
 */
export const cancelEnrollment = async (courseId) => {
  const response = await api.delete(`/enrollments/${courseId}`);
  return response.data;
};

/**
 * Administrative retrieval of all system-wide student enrollments.
 * @param {Object} params { status, search, page, limit }
 */
export const getAdminEnrollments = async (params) => {
  const response = await api.get('/admin/enrollments', { params });
  return response.data;
};

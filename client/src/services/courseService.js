import api from './api';

/**
 * Fetches course lists matching query filter options.
 * @param {Object} params { search, category, level, status, sort, page, limit }
 */
export const getCourses = async (params) => {
  const response = await api.get('/courses', { params });
  return response.data;
};

/**
 * Fetches details of a single course by slug.
 * @param {string} slug 
 */
export const getCourse = async (slug) => {
  const response = await api.get(`/courses/${slug}`);
  return response.data;
};

/**
 * Creates a new Course.
 * @param {Object} data Create Course Payload
 */
export const createCourse = async (data) => {
  const response = await api.post('/courses', data);
  return response.data;
};

/**
 * Updates an existing Course.
 * @param {string} id Course database ID
 * @param {Object} data Update Course Payload
 */
export const updateCourse = async (id, data) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};

/**
 * Publishes a Course.
 * @param {string} id Course database ID
 */
export const publishCourse = async (id) => {
  const response = await api.patch(`/courses/${id}/publish`);
  return response.data;
};

/**
 * Archives a Course.
 * @param {string} id Course database ID
 */
export const archiveCourse = async (id) => {
  const response = await api.patch(`/courses/${id}/archive`);
  return response.data;
};

/**
 * Soft deletes a Course.
 * @param {string} id Course database ID
 */
export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

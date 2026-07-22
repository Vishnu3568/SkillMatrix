import api from './api';

/**
 * Lists active/published lessons of a course.
 * @param {string} courseId Parent course database ID
 * @param {Object} params { search, status }
 */
export const getLessons = async (courseId, params) => {
  const response = await api.get(`/courses/${courseId}/lessons`, { params });
  return response.data;
};

/**
 * Gets details of a single lesson by slug.
 * @param {string} slug 
 */
export const getLesson = async (slug) => {
  const response = await api.get(`/lessons/${slug}`);
  return response.data;
};

/**
 * Creates a new Lesson inside a course syllabus.
 * @param {string} courseId 
 * @param {Object} data Create Lesson Payload
 */
export const createLesson = async (courseId, data) => {
  const response = await api.post(`/courses/${courseId}/lessons`, data);
  return response.data;
};

/**
 * Updates details of an existing Lesson.
 * @param {string} id Lesson database ID
 * @param {Object} data Update Lesson Payload
 */
export const updateLesson = async (id, data) => {
  const response = await api.put(`/lessons/${id}`, data);
  return response.data;
};

/**
 * Publishes a Lesson.
 * @param {string} id Lesson database ID
 */
export const publishLesson = async (id) => {
  const response = await api.patch(`/lessons/${id}/publish`);
  return response.data;
};

/**
 * Archives a Lesson.
 * @param {string} id Lesson database ID
 */
export const archiveLesson = async (id) => {
  const response = await api.patch(`/lessons/${id}/archive`);
  return response.data;
};

/**
 * Soft deletes a Lesson (with automatic rear shifts).
 * @param {string} id Lesson database ID
 */
export const deleteLesson = async (id) => {
  const response = await api.delete(`/lessons/${id}`);
  return response.data;
};

/**
 * Reorders lessons within a course syllabus.
 * @param {string} courseId 
 * @param {Array<string>} orderedIds List of Lesson ObjectIds in the target order sequence
 */
export const reorderLessons = async (courseId, orderedIds) => {
  const response = await api.patch(`/courses/${courseId}/lessons/reorder`, { orderedIds });
  return response.data;
};

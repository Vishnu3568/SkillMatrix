import api from './api';

/**
 * Signals start of a lesson session for current student.
 * @param {string} lessonId Lesson database ID
 */
export const startLesson = async (lessonId) => {
  const response = await api.post(`/lessons/${lessonId}/start`);
  return response.data;
};

/**
 * Updates video watch duration and percentage.
 * @param {string} lessonId Lesson database ID
 * @param {Object} data { watchTimeSeconds, progressPercent }
 */
export const updateProgress = async (lessonId, data) => {
  const response = await api.patch(`/lessons/${lessonId}/progress`, data);
  return response.data;
};

/**
 * Marks a lesson as 100% complete for the current student.
 * @param {string} lessonId Lesson database ID
 */
export const completeLesson = async (lessonId) => {
  const response = await api.post(`/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * Retrieves progress metadata for a single lesson.
 * @param {string} lessonId Lesson database ID
 */
export const getLessonProgress = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/progress`);
  return response.data;
};

/**
 * Fetches course completion progress metrics (completed count, total, percentage, next lesson).
 * @param {string} courseId Course database ID
 */
export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/progress`);
  return response.data;
};

/**
 * Retrieves target lesson object for "Continue Learning" action.
 * @param {string} courseId Course database ID
 */
export const getContinueLearning = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/continue`);
  return response.data;
};

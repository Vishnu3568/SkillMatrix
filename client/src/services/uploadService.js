import api from './api';

/**
 * Uploads an image file (course/lesson thumbnail).
 * @param {File} file File object
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Uploads a document or archive resource (PDF, ZIP, TXT).
 * @param {File} file File object
 */
export const uploadResource = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploads/resource', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Deletes an uploaded file from server storage.
 * @param {string} filename File name
 */
export const deleteFile = async (filename) => {
  const response = await api.delete(`/uploads/${filename}`);
  return response.data;
};

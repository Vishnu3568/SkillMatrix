/**
 * Pure Utility Helpers
 */

/**
 * Calculates pagination offsets and limit constraints.
 * @param {Object} query Express query params (page, limit)
 * @returns {Object} { page, limit, skip }
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Generates a URL-friendly slug from text.
 * @param {string} text 
 * @returns {string}
 */
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

/**
 * Formats date into standard readable format.
 * @param {Date|string} date 
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Validates whether a string is a valid web URL.
 * @param {string} urlString 
 * @returns {boolean}
 */
const isValidUrl = (urlString) => {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

module.exports = {
  getPaginationParams,
  generateSlug,
  formatDate,
  isValidUrl,
};

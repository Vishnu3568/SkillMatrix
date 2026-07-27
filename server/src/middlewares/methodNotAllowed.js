const { errorResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

/**
 * Middleware to handle 405 Method Not Allowed responses for unhandled HTTP verbs on registered paths.
 * @param {Array<string>} allowedMethods Array of allowed HTTP method strings (e.g., ['GET', 'POST'])
 */
const methodNotAllowed = (allowedMethods = []) => {
  return (req, res) => {
    res.setHeader('Allow', allowedMethods.join(', '));
    return errorResponse(
      res,
      HTTP_STATUS.METHOD_NOT_ALLOWED || 405,
      'METHOD_NOT_ALLOWED',
      `HTTP ${req.method} is not supported for this endpoint. Allowed methods: ${allowedMethods.join(', ')}`
    );
  };
};

module.exports = methodNotAllowed;

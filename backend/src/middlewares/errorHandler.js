const env = require('../config/env');
const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log all errors
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  if (env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        stack: err.stack,
        details: err.details || [],
      },
    });
  }

  // Production response handling
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.errorCode, err.message, err.details || []);
  }

  // Unhandled operational/system bugs in production
  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'An unexpected system error occurred. Please try again later.'
  );
};

module.exports = errorHandler;

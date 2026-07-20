const env = require('../config/env');
const { logger } = require('../logger');
const { errorResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log error using Pino
  logger.error(err, `${req.method} ${req.originalUrl} failed`);

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

  // Production response (obscure system details)
  if (err.isOperational) {
    return errorResponse(res, err.statusCode, err.errorCode, err.message, err.details || []);
  }

  // Fatal / Programming bugs
  return errorResponse(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'INTERNAL_ERROR',
    'An unexpected system error occurred. Please try again later.'
  );
};

module.exports = errorHandler;

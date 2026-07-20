const { HTTP_STATUS } = require('../constants');

const successResponse = (res, statusCode = HTTP_STATUS.OK, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = 'INTERNAL_ERROR', message = 'An error occurred', details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
  });
};

const validationErrorResponse = (res, message = 'Validation failed', details = []) => {
  return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', message, details);
};

const paginationResponse = (
  res,
  statusCode = HTTP_STATUS.OK,
  message = 'Success',
  data = [],
  paginationMeta = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: paginationMeta.page || 1,
      limit: paginationMeta.limit || 10,
      totalCount: paginationMeta.totalCount || 0,
      totalPages: paginationMeta.totalPages || 0,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginationResponse,
};

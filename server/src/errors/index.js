const { HTTP_STATUS } = require('../constants');

class AppError extends Error {
  constructor(message, statusCode, errorCode = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT');
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', false);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
};

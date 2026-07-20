const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
};

const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  SERVER_HEALTHY: 'SkillMatrix API is healthy',
  DATABASE_CONNECTED: 'Database connection established successfully',
  DATABASE_CONNECTION_ERROR: 'Database connection encountered an error',
  DATABASE_DISCONNECTED: 'Database connection disconnected',
  DATABASE_TERMINATED: 'Database connection closed cleanly due to application termination',
  INTERNAL_SERVER_ERROR: 'An unexpected system error occurred. Please try again later.',
  ROUTE_NOT_FOUND: 'Resource not found on this server',
  RATE_LIMIT_EXCEEDED: 'Too many requests from this IP, please try again later.',
};

module.exports = {
  ROLES,
  COURSE_STATUS,
  COURSE_LEVELS,
  PROGRESS_STATUS,
  HTTP_STATUS,
  MESSAGES,
};

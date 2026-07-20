const User = require('../models/User');
const { verifyAccessToken } = require('../services/jwt.service');
const { UnauthorizedError, ForbiddenError } = require('../errors');
const { USER_STATUS } = require('../constants');

/**
 * Extracts bearer token from request headers.
 */
const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Authentication Guard Middleware.
 * Verifies access token, checks user status, and validates activeSessionHash.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedError('Authentication token is required');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User profile not found');
    }

    // Check account status
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new UnauthorizedError('Your account has been deactivated or blocked');
    }

    // Verify session has not been invalidated
    if (decoded.activeSessionHash !== user.activeSessionHash) {
      throw new UnauthorizedError('Session expired. Please login again.');
    }

    // Attach user profile context to request object
    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware.
 * Extracts user if token is valid, otherwise passes through anonymously.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next(); // Pass through anonymously
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(); // Fail silently for optional auth
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status !== USER_STATUS.ACTIVE) {
      return next();
    }

    if (decoded.activeSessionHash !== user.activeSessionHash) {
      return next();
    }

    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization Guard Middleware.
 * Restricts route access to specified roles.
 * @param {...string} allowedRoles Allowed user roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
};

const crypto = require('crypto');
const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../constants');
const { hashPassword, comparePassword } = require('./password.service');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('./jwt.service');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../errors');

/**
 * Register a new Student user.
 * Admin registration is blocked by design.
 */
const registerStudent = async (fullName, email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check for duplicate account
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  const newUser = await User.create({
    fullName,
    email: normalizedEmail,
    passwordHash,
    role: ROLES.STUDENT, // Force Student role
    status: USER_STATUS.ACTIVE,
  });

  return newUser;
};

/**
 * Login user and generate tokens.
 */
const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // Generic error to prevent email enumeration
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify status
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new UnauthorizedError('Your account has been deactivated or blocked');
  }

  // Verify password
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate new session identifier
  const activeSessionHash = crypto.randomBytes(16).toString('hex');

  // Increment refreshTokenVersion to invalidate older refresh tokens on login
  user.refreshTokenVersion += 1;
  user.activeSessionHash = activeSessionHash;
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    activeSessionHash,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    version: user.refreshTokenVersion,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Logout user and invalidate active session.
 */
const logout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Invalidate refresh tokens and session hash
  user.refreshTokenVersion += 1;
  user.activeSessionHash = '';
  await user.save();
};

/**
 * Refreshes tokens using token rotation.
 */
const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new UnauthorizedError('User associated with this token not found');
  }

  // Check account status
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new UnauthorizedError('Your account is no longer active');
  }

  // Check refresh token version to prevent replay attacks
  if (decoded.version !== user.refreshTokenVersion) {
    // Token replayed/stolen! Invalidate all sessions immediately as a security precaution.
    user.refreshTokenVersion += 1;
    user.activeSessionHash = '';
    await user.save();
    throw new UnauthorizedError('Security warning: Refresh token replayed. Session revoked.');
  }

  // Rotate credentials: create a new session hash and increment version
  const activeSessionHash = crypto.randomBytes(16).toString('hex');
  user.refreshTokenVersion += 1;
  user.activeSessionHash = activeSessionHash;
  await user.save();

  const newAccessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    activeSessionHash,
  });

  const newRefreshToken = generateRefreshToken({
    id: user._id,
    version: user.refreshTokenVersion,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Get current user profile information.
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new NotFoundError('User profile not found');
  }
  return user;
};

module.exports = {
  registerStudent,
  login,
  logout,
  refreshToken,
  getCurrentUser,
};

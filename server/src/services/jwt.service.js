const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ACCESS_TOKEN_EXPIRE = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRE = '7d';  // Long-lived refresh token

/**
 * Generates an Access Token.
 * @param {Object} payload { id, role, activeSessionHash }
 * @returns {string} Signed JWT Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE,
  });
};

/**
 * Generates a Refresh Token.
 * @param {Object} payload { id, tokenVersion }
 * @returns {string} Signed JWT Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE,
  });
};

/**
 * Verifies an Access Token.
 * @param {string} token Signed Access Token
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verifies a Refresh Token.
 * @param {string} token Signed Refresh Token
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

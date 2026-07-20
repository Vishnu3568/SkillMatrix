const authService = require('../services/auth.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');
const env = require('../config/env');

const COOKIE_NAME = 'refreshToken';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const registerStudent = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await authService.registerStudent(fullName, email, password);

    // Exclude passwordHash from output representation
    const userJson = user.toObject();
    delete userJson.passwordHash;

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      'Registration successful',
      { user: userJson }
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Exclude passwordHash
    const userJson = user.toObject();
    delete userJson.passwordHash;

    // Send Refresh Token in a secure HttpOnly cookie
    res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());

    return successResponse(res, HTTP_STATUS.OK, 'Login successful', {
      user: userJson,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await authService.logout(userId);

    // Clear client session cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return successResponse(res, HTTP_STATUS.OK, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    // Attempt parsing token from cookies first, fall back to body
    const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;

    if (!token) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token);

    // Rotate the refresh token in the secure cookie
    res.cookie(COOKIE_NAME, newRefreshToken, getCookieOptions());

    return successResponse(res, HTTP_STATUS.OK, 'Tokens refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getCurrentUser(userId);

    return successResponse(res, HTTP_STATUS.OK, 'Current user profile fetched', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  login,
  logout,
  refreshToken,
  getCurrentUser,
};

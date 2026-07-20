/* global describe, it, expect, beforeAll, afterAll, beforeEach */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const { USER_STATUS, ROLES } = require('../constants');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  const registerPayload = {
    fullName: 'Test Student',
    email: 'student@example.com',
    password: 'Password1!',
  };

  describe('POST /api/auth/register', () => {
    it('should successfully register a new student user with role STUDENT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(registerPayload.email.toLowerCase());
      expect(res.body.data.user.role).toBe(ROLES.STUDENT);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      const dbUser = await User.findOne({ email: registerPayload.email });
      expect(dbUser).toBeDefined();
      expect(dbUser.fullName).toBe(registerPayload.fullName);
    });

    it('should reject registration if email is already in use', async () => {
      await request(app).post('/api/auth/register').send(registerPayload);

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject registration with validation error if password is weak', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...registerPayload,
          password: 'weak',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...registerPayload,
          email: 'notanemail',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(registerPayload);
    });

    it('should login successfully and return access token and set cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check cookie headers
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken');
    });

    it('should reject login with generic error for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: 'WrongPassword123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should reject login if user is blocked', async () => {
      await User.updateOne(
        { email: registerPayload.email },
        { status: USER_STATUS.BLOCKED }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('deactivated or blocked');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should rotate access token and cookie if valid refresh token is passed', async () => {
      // 1. Register & Login
      await request(app).post('/api/auth/register').send(registerPayload);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      const cookies = loginRes.headers['set-cookie'];
      const refreshTokenCookie = cookies[0].split(';')[0]; // Format: refreshToken=xxx

      // 2. Invoke refresh
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [refreshTokenCookie])
        .send();

      expect(refreshRes.statusCode).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();

      const newCookies = refreshRes.headers['set-cookie'];
      expect(newCookies).toBeDefined();
    });

    it('should reject refresh if token is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_value'])
        .send();

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user context if bearer token is valid', async () => {
      // 1. Register & Login
      await request(app).post('/api/auth/register').send(registerPayload);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      const token = loginRes.body.data.accessToken;

      // 2. Fetch profile
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(registerPayload.email);
    });

    it('should reject access if token is missing', async () => {
      const res = await request(app).get('/api/auth/me').send();

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout, clear refresh cookie, and invalidate refresh token', async () => {
      // 1. Register & Login
      await request(app).post('/api/auth/register').send(registerPayload);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      const token = loginRes.body.data.accessToken;
      const cookies = loginRes.headers['set-cookie'];
      const refreshTokenCookie = cookies[0].split(';')[0];

      // 2. Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Verify cookie is cleared (has Expires header in the past)
      const logoutCookies = logoutRes.headers['set-cookie'];
      expect(logoutCookies).toBeDefined();
      expect(logoutCookies[0]).toContain('Expires=Thu, 01 Jan 1970');

      // 3. Further refresh attempts should fail
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [refreshTokenCookie])
        .send();

      expect(refreshRes.statusCode).toBe(401);
      expect(refreshRes.body.success).toBe(false);
    });
  });
});

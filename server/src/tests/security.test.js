/* global describe, it, expect, beforeAll, afterAll */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');

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

describe('Production Security & Error Handling Infrastructure', () => {
  describe('Security Headers Inspection', () => {
    it('should inject security response headers', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('Global 404 & 405 Error Handling', () => {
    it('should return standardized JSON for non-existent routes', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('JWT Security Enforcement', () => {
    it('should reject malformed Bearer tokens with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.string');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

/* global describe, it, expect, beforeAll, afterAll */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const { ROLES } = require('../constants');
const { hashPassword } = require('../services/password.service');
const { generateAccessToken } = require('../services/jwt.service');

let mongoServer;
let adminToken;
let studentToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const passwordHash = await hashPassword('Password123!');

  const admin = await User.create({
    fullName: 'Media Admin',
    email: 'mediaadmin@example.com',
    passwordHash,
    role: ROLES.ADMIN,
    activeSessionHash: 'adminsession',
  });
  adminToken = generateAccessToken({
    id: admin._id,
    role: admin.role,
    activeSessionHash: admin.activeSessionHash,
  });

  const student = await User.create({
    fullName: 'Media Student',
    email: 'mediastudent@example.com',
    passwordHash,
    role: ROLES.STUDENT,
    activeSessionHash: 'studentsession',
  });
  studentToken = generateAccessToken({
    id: student._id,
    role: student.role,
    activeSessionHash: student.activeSessionHash,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Media & Resource Upload API', () => {
  let uploadedFilename = '';

  describe('POST /api/uploads/image', () => {
    it('should allow Admin to upload a valid image file', async () => {
      const buffer = Buffer.from('fake-png-image-content');

      const res = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, { filename: 'sample.png', contentType: 'image/png' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.file.url).toContain('/uploads/');
      expect(res.body.data.file.filename).toBeDefined();

      uploadedFilename = res.body.data.file.filename;
    });

    it('should reject invalid non-image file types', async () => {
      const buffer = Buffer.from('fake-exe-content');

      const res = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, { filename: 'malicious.exe', contentType: 'application/x-msdownload' });

      expect(res.statusCode).toBe(400);
    });

    it('should block non-admin Student users with 403 Forbidden', async () => {
      const buffer = Buffer.from('fake-image-content');

      const res = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

      expect(res.statusCode).toBe(403);
    });

    it('should block unauthenticated Guests with 401 Unauthorized', async () => {
      const buffer = Buffer.from('fake-image-content');

      const res = await request(app)
        .post('/api/uploads/image')
        .attach('file', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/uploads/resource', () => {
    it('should allow Admin to upload a PDF resource document', async () => {
      const buffer = Buffer.from('%PDF-1.4 sample pdf content');

      const res = await request(app)
        .post('/api/uploads/resource')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, { filename: 'cheatsheet.pdf', contentType: 'application/pdf' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resource.type).toBe('pdf');
      expect(res.body.data.resource.url).toContain('/uploads/');
    });
  });

  describe('DELETE /api/uploads/:filename', () => {
    it('should allow Admin to delete an uploaded file', async () => {
      expect(uploadedFilename).not.toBe('');

      const res = await request(app)
        .delete(`/api/uploads/${uploadedFilename}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

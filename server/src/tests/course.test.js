/* global describe, it, expect, beforeAll, afterAll, beforeEach */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const { ROLES, COURSE_STATUS, COURSE_LEVELS } = require('../constants');
const { hashPassword } = require('../services/password.service');
const { generateAccessToken } = require('../services/jwt.service');

let mongoServer;
let adminToken;
let studentToken;
let adminId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create accounts directly to generate auth tokens
  const passwordHash = await hashPassword('Password123!');

  const admin = await User.create({
    fullName: 'System Admin',
    email: 'admin@example.com',
    passwordHash,
    role: ROLES.ADMIN,
    activeSessionHash: 'adminsessionhash',
  });
  adminId = admin._id;
  adminToken = generateAccessToken({
    id: admin._id,
    role: admin.role,
    activeSessionHash: admin.activeSessionHash,
  });

  const student = await User.create({
    fullName: 'Learner Student',
    email: 'student@example.com',
    passwordHash,
    role: ROLES.STUDENT,
    activeSessionHash: 'studentsessionhash',
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

beforeEach(async () => {
  await Course.deleteMany({});
});

describe('Course Management API Endpoints', () => {
  const sampleCourseData = {
    title: 'Introduction to React',
    shortDescription: 'Master modern frontend UI development.',
    description: 'A comprehensive guide to React hooks, components, and state management.',
    category: 'Web Development',
    level: COURSE_LEVELS.BEGINNER,
    estimatedDuration: 180,
    tags: ['react', 'js', 'frontend'],
  };

  describe('POST /api/courses', () => {
    it('should allow Admin to successfully create a new Course in DRAFT status', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleCourseData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course).toBeDefined();
      expect(res.body.data.course.title).toBe(sampleCourseData.title);
      expect(res.body.data.course.status).toBe(COURSE_STATUS.DRAFT);
      expect(res.body.data.course.slug).toBe('introduction-to-react');
      expect(res.body.data.course.createdBy).toBe(adminId.toString());
    });

    it('should reject Course creation if user is a Student (Forbidden)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(sampleCourseData);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should generate unique slugs for courses with duplicate titles', async () => {
      // 1. Create first course
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleCourseData);

      // 2. Create duplicate title course
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleCourseData);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.course.slug).toBe('introduction-to-react-1');
    });
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      // Create one draft and one published course
      await Course.create({
        ...sampleCourseData,
        title: 'Draft Course',
        status: COURSE_STATUS.DRAFT,
        createdBy: adminId,
      });

      await Course.create({
        ...sampleCourseData,
        title: 'Published Course',
        status: COURSE_STATUS.PUBLISHED,
        createdBy: adminId,
      });
    });

    it('should return all active courses (draft and published) for Admin', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses).toHaveLength(2);
    });

    it('should return ONLY published courses for Students/Guests', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses).toHaveLength(1);
      expect(res.body.data.courses[0].title).toBe('Published Course');
    });
  });

  describe('GET /api/courses/:slug', () => {
    let draftCourse;
    let publishedCourse;

    beforeEach(async () => {
      draftCourse = await Course.create({
        ...sampleCourseData,
        title: 'Draft Course Title',
        status: COURSE_STATUS.DRAFT,
        createdBy: adminId,
      });

      publishedCourse = await Course.create({
        ...sampleCourseData,
        title: 'Published Course Title',
        status: COURSE_STATUS.PUBLISHED,
        createdBy: adminId,
      });
    });

    it('should return draft course details for Admin', async () => {
      const res = await request(app)
        .get(`/api/courses/${draftCourse.slug}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.course.title).toBe('Draft Course Title');
    });

    it('should block Student from viewing draft course details (404 NotFound to prevent leak)', async () => {
      const res = await request(app)
        .get(`/api/courses/${draftCourse.slug}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(404);
    });

    it('should allow Student to view published course details', async () => {
      const res = await request(app)
        .get(`/api/courses/${publishedCourse.slug}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.course.title).toBe('Published Course Title');
    });
  });

  describe('PUT /api/courses/:id', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        ...sampleCourseData,
        createdBy: adminId,
      });
    });

    it('should allow Admin to successfully update course details', async () => {
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated React Course',
          category: 'Mobile Dev',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.course.title).toBe('Updated React Course');
      expect(res.body.data.course.category).toBe('Mobile Dev');
    });

    it('should block Student from updating course details', async () => {
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Attempted Hack',
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/courses/:id/publish & /archive', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        ...sampleCourseData,
        status: COURSE_STATUS.DRAFT,
        createdBy: adminId,
      });
    });

    it('should allow Admin to publish a course', async () => {
      const res = await request(app)
        .patch(`/api/courses/${course._id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.course.status).toBe(COURSE_STATUS.PUBLISHED);
    });

    it('should allow Admin to archive a course', async () => {
      const res = await request(app)
        .patch(`/api/courses/${course._id}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.course.status).toBe(COURSE_STATUS.ARCHIVED);
    });
  });

  describe('DELETE /api/courses/:id (Soft Delete)', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        ...sampleCourseData,
        createdBy: adminId,
      });
    });

    it('should soft-delete course and omit from default list querying', async () => {
      // 1. Delete course
      const deleteRes = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(deleteRes.statusCode).toBe(200);

      // Verify DB flags
      const dbCourse = await Course.findById(course._id);
      expect(dbCourse.isDeleted).toBe(true);
      expect(dbCourse.deletedAt).toBeDefined();

      // 2. Query courses (should be empty list)
      const listRes = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(listRes.body.data.courses).toHaveLength(0);
    });
  });
});

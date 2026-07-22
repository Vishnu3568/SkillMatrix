/* global describe, it, expect, beforeAll, afterAll, beforeEach */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { ROLES, COURSE_STATUS, COURSE_LEVELS, RESOURCE_TYPES } = require('../constants');
const { hashPassword } = require('../services/password.service');
const { generateAccessToken } = require('../services/jwt.service');

let mongoServer;
let adminToken;
let studentToken;
let adminId;
let studentId;
let courseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const passwordHash = await hashPassword('Password123!');

  const admin = await User.create({
    fullName: 'LMS Admin',
    email: 'admin@example.com',
    passwordHash,
    role: ROLES.ADMIN,
    activeSessionHash: 'adminsession',
  });
  adminId = admin._id;
  adminToken = generateAccessToken({
    id: admin._id,
    role: admin.role,
    activeSessionHash: admin.activeSessionHash,
  });

  const student = await User.create({
    fullName: 'LMS Student',
    email: 'student@example.com',
    passwordHash,
    role: ROLES.STUDENT,
    activeSessionHash: 'studentsession',
  });
  studentId = student._id;
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
  await Lesson.deleteMany({});
  await Enrollment.deleteMany({});

  const course = await Course.create({
    title: 'Advanced Javascript Masterclass',
    shortDescription: 'Master asynchronous js, execution contexts, and V8.',
    description: 'Detailed curriculum details.',
    category: 'Web Development',
    level: COURSE_LEVELS.ADVANCED,
    estimatedDuration: 120,
    status: COURSE_STATUS.PUBLISHED,
    createdBy: adminId,
  });
  courseId = course._id;
});

describe('Lesson Management API Endpoints', () => {
  const sampleLessonData = {
    title: 'Execution Context & V8 Engines',
    description: 'Understand stacks, heaps, and phases.',
    videoUrl: 'https://www.youtube.com/watch?v=sample',
    duration: 360,
    isPreview: true,
    resources: [
      {
        title: 'V8 Architecture diagram',
        type: RESOURCE_TYPES.PDF,
        url: 'https://example.com/diag.pdf',
        size: '1.2 MB',
      },
    ],
  };

  describe('POST /api/courses/:courseId/lessons', () => {
    it('should allow Admin to successfully create a new lesson with automatic order assignment', async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLessonData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson.order).toBe(1); // First lesson gets order 1
      expect(res.body.data.lesson.status).toBe(COURSE_STATUS.DRAFT);
    });

    it('should block Student from creating a lesson', async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(sampleLessonData);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/courses/:courseId/lessons (Syllabus List)', () => {
    beforeEach(async () => {
      // Create lessons
      await Lesson.create({
        ...sampleLessonData,
        title: 'Lesson 1',
        order: 1,
        courseId,
        createdBy: adminId,
        status: COURSE_STATUS.PUBLISHED,
      });

      await Lesson.create({
        ...sampleLessonData,
        title: 'Lesson 2 (Draft)',
        order: 2,
        courseId,
        createdBy: adminId,
        status: COURSE_STATUS.DRAFT,
      });
    });

    it('should return all lessons (published and draft) for Admins', async () => {
      const res = await request(app)
        .get(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lessons).toHaveLength(2);
    });

    it('should return only published lessons for Students', async () => {
      const res = await request(app)
        .get(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lessons).toHaveLength(1);
      expect(res.body.data.lessons[0].title).toBe('Lesson 1');
    });
  });

  describe('GET /api/lessons/:slug (Singleton Detail View)', () => {
    let previewLesson;
    let privateLesson;

    beforeEach(async () => {
      previewLesson = await Lesson.create({
        ...sampleLessonData,
        title: 'Preview Video Lesson',
        order: 1,
        courseId,
        isPreview: true,
        createdBy: adminId,
        status: COURSE_STATUS.PUBLISHED,
      });

      privateLesson = await Lesson.create({
        ...sampleLessonData,
        title: 'Locked Advanced Lesson',
        order: 2,
        courseId,
        isPreview: false,
        createdBy: adminId,
        status: COURSE_STATUS.PUBLISHED,
      });
    });

    it('should allow Guest users to fetch details for PREVIEW lessons', async () => {
      const res = await request(app)
        .get(`/api/lessons/${previewLesson.slug}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lesson.title).toBe('Preview Video Lesson');
    });

    it('should block Guest users from fetching details for LOCKED lessons (401/403 checks)', async () => {
      const res = await request(app)
        .get(`/api/lessons/${privateLesson.slug}`)
        .send();

      expect(res.statusCode).toBe(403);
    });

    it('should allow registered Students to view locked lessons when enrolled', async () => {
      await Enrollment.create({
        studentId,
        courseId,
        status: 'active',
      });

      const res = await request(app)
        .get(`/api/lessons/${privateLesson.slug}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lesson.title).toBe('Locked Advanced Lesson');
    });
  });

  describe('PATCH /api/courses/:courseId/lessons/reorder', () => {
    let l1;
    let l2;
    let l3;

    beforeEach(async () => {
      l1 = await Lesson.create({ ...sampleLessonData, title: 'Lesson One', order: 1, courseId, createdBy: adminId });
      l2 = await Lesson.create({ ...sampleLessonData, title: 'Lesson Two', order: 2, courseId, createdBy: adminId });
      l3 = await Lesson.create({ ...sampleLessonData, title: 'Lesson Three', order: 3, courseId, createdBy: adminId });
    });

    it('should allow Admin to successfully swap lesson positions without index key collisions', async () => {
      // Swap order: l3 -> l1 -> l2
      const res = await request(app)
        .patch(`/api/courses/${courseId}/lessons/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderedIds: [l3._id.toString(), l1._id.toString(), l2._id.toString()],
        });

      expect(res.statusCode).toBe(200);

      // Fetch from database and check orders
      const dbL3 = await Lesson.findById(l3._id);
      const dbL1 = await Lesson.findById(l1._id);
      const dbL2 = await Lesson.findById(l2._id);

      expect(dbL3.order).toBe(1);
      expect(dbL1.order).toBe(2);
      expect(dbL2.order).toBe(3);
    });
  });

  describe('DELETE /api/lessons/:id (Soft Delete Reordering)', () => {
    let l1;
    let l2;
    let l3;

    beforeEach(async () => {
      l1 = await Lesson.create({ ...sampleLessonData, title: 'Lesson A', order: 1, courseId, createdBy: adminId });
      l2 = await Lesson.create({ ...sampleLessonData, title: 'Lesson B', order: 2, courseId, createdBy: adminId });
      l3 = await Lesson.create({ ...sampleLessonData, title: 'Lesson C', order: 3, courseId, createdBy: adminId });
    });

    it('should soft-delete middle lesson and shift order values down', async () => {
      const res = await request(app)
        .delete(`/api/lessons/${l2._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);

      // Verify B B remains but marked deleted
      const dbL2 = await Lesson.findById(l2._id);
      expect(dbL2.isDeleted).toBe(true);

      // Verify A and C orders
      const dbL1 = await Lesson.findById(l1._id);
      const dbL3 = await Lesson.findById(l3._id);

      expect(dbL1.order).toBe(1);
      expect(dbL3.order).toBe(2); // Lesson C shifted down from 3 to 2!
    });
  });
});

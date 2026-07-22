/* global describe, it, expect, beforeAll, afterAll, beforeEach */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { ROLES, COURSE_STATUS, COURSE_LEVELS } = require('../constants');
const { hashPassword } = require('../services/password.service');
const { generateAccessToken } = require('../services/jwt.service');

let mongoServer;
let adminToken;
let studentToken;
let secondStudentToken;
let adminId;
let studentId;
let publishedCourseId;
let draftCourseId;
let previewLessonSlug;
let lockedLessonSlug;

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

  const secondStudent = await User.create({
    fullName: 'Second Student',
    email: 'student2@example.com',
    passwordHash,
    role: ROLES.STUDENT,
    activeSessionHash: 'student2session',
  });
  secondStudentToken = generateAccessToken({
    id: secondStudent._id,
    role: secondStudent.role,
    activeSessionHash: secondStudent.activeSessionHash,
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

  const pubCourse = await Course.create({
    title: 'Node.js System Architecture',
    shortDescription: 'Master streams, events, and scaling.',
    description: 'Detailed curriculum details.',
    category: 'Web Development',
    level: COURSE_LEVELS.INTERMEDIATE,
    estimatedDuration: 180,
    status: COURSE_STATUS.PUBLISHED,
    createdBy: adminId,
  });
  publishedCourseId = pubCourse._id;

  const draftCourse = await Course.create({
    title: 'Unpublished Draft Course',
    shortDescription: 'Draft contents.',
    description: 'Draft description.',
    category: 'Web Development',
    level: COURSE_LEVELS.BEGINNER,
    estimatedDuration: 60,
    status: COURSE_STATUS.DRAFT,
    createdBy: adminId,
  });
  draftCourseId = draftCourse._id;

  const previewLesson = await Lesson.create({
    title: 'Free Intro Lesson',
    description: 'Public preview',
    videoUrl: 'https://youtube.com/watch?v=123',
    duration: 300,
    order: 1,
    isPreview: true,
    status: COURSE_STATUS.PUBLISHED,
    courseId: publishedCourseId,
    createdBy: adminId,
  });
  previewLessonSlug = previewLesson.slug;

  const lockedLesson = await Lesson.create({
    title: 'Advanced Streams Deep Dive',
    description: 'Enrolled students only',
    videoUrl: 'https://youtube.com/watch?v=456',
    duration: 600,
    order: 2,
    isPreview: false,
    status: COURSE_STATUS.PUBLISHED,
    courseId: publishedCourseId,
    createdBy: adminId,
  });
  lockedLessonSlug = lockedLesson.slug;
});

describe('Enrollment Module API Endpoints', () => {
  describe('POST /api/courses/:courseId/enroll', () => {
    it('should allow authenticated Student to enroll in a published course', async () => {
      const res = await request(app)
        .post(`/api/courses/${publishedCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment.status).toBe('active');
    });

    it('should block duplicate active enrollments with 409 Conflict', async () => {
      // First enrollment
      await request(app)
        .post(`/api/courses/${publishedCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      // Duplicate attempt
      const res = await request(app)
        .post(`/api/courses/${publishedCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should block enrollment in non-published courses', async () => {
      const res = await request(app)
        .post(`/api/courses/${draftCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(400);
    });

    it('should block Guest users from enrolling', async () => {
      const res = await request(app)
        .post(`/api/courses/${publishedCourseId}/enroll`)
        .send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/enrollments/:courseId/status', () => {
    it('should return isEnrolled: false when student is not enrolled', async () => {
      const res = await request(app)
        .get(`/api/enrollments/${publishedCourseId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isEnrolled).toBe(false);
    });

    it('should return isEnrolled: true when student is enrolled', async () => {
      await Enrollment.create({
        studentId,
        courseId: publishedCourseId,
        status: 'active',
      });

      const res = await request(app)
        .get(`/api/enrollments/${publishedCourseId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isEnrolled).toBe(true);
    });
  });

  describe('GET /api/my-learning', () => {
    it('should return empty list when student has no active enrollments', async () => {
      const res = await request(app)
        .get('/api/my-learning')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.enrollments).toHaveLength(0);
    });

    it('should return active enrolled courses for the authenticated student', async () => {
      await Enrollment.create({
        studentId,
        courseId: publishedCourseId,
        status: 'active',
      });

      const res = await request(app)
        .get('/api/my-learning')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.enrollments).toHaveLength(1);
      expect(res.body.data.enrollments[0].courseId.title).toBe('Node.js System Architecture');
    });
  });

  describe('Lesson Access Control Verification', () => {
    it('should allow any student to access PREVIEW lessons without enrollment', async () => {
      const res = await request(app)
        .get(`/api/lessons/${previewLessonSlug}`)
        .set('Authorization', `Bearer ${secondStudentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lesson.title).toBe('Free Intro Lesson');
    });

    it('should block non-enrolled students from accessing LOCKED non-preview lessons', async () => {
      const res = await request(app)
        .get(`/api/lessons/${lockedLessonSlug}`)
        .set('Authorization', `Bearer ${secondStudentToken}`)
        .send();

      expect(res.statusCode).toBe(403);
    });

    it('should allow ENROLLED students to access locked non-preview lessons', async () => {
      await Enrollment.create({
        studentId,
        courseId: publishedCourseId,
        status: 'active',
      });

      const res = await request(app)
        .get(`/api/lessons/${lockedLessonSlug}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lesson.title).toBe('Advanced Streams Deep Dive');
    });
  });

  describe('DELETE /api/enrollments/:courseId', () => {
    it('should allow student to cancel an active enrollment', async () => {
      await Enrollment.create({
        studentId,
        courseId: publishedCourseId,
        status: 'active',
      });

      const res = await request(app)
        .delete(`/api/enrollments/${publishedCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.enrollment.status).toBe('cancelled');
    });
  });

  describe('GET /api/admin/enrollments', () => {
    it('should allow Admin to list all enrollments', async () => {
      await Enrollment.create({
        studentId,
        courseId: publishedCourseId,
        status: 'active',
      });

      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.enrollments).toHaveLength(1);
    });

    it('should block Students from accessing admin enrollments list', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(403);
    });
  });
});

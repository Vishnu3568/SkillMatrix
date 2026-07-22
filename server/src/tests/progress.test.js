/* global describe, it, expect, beforeAll, afterAll, beforeEach */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const { ROLES, COURSE_STATUS, COURSE_LEVELS } = require('../constants');
const { hashPassword } = require('../services/password.service');
const { generateAccessToken } = require('../services/jwt.service');

let mongoServer;
let adminId;
let studentToken;
let secondStudentToken;
let studentId;
let publishedCourseId;
let lesson1Id;
let lesson2Id;

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

  const student = await User.create({
    fullName: 'Enrolled Student',
    email: 'enrolled@example.com',
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
    fullName: 'Unenrolled Student',
    email: 'unenrolled@example.com',
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
  await Progress.deleteMany({});

  const pubCourse = await Course.create({
    title: 'React Design Systems',
    shortDescription: 'Master reusable UI engineering.',
    description: 'Detailed description.',
    category: 'Web Development',
    level: COURSE_LEVELS.INTERMEDIATE,
    estimatedDuration: 120,
    status: COURSE_STATUS.PUBLISHED,
    createdBy: adminId,
  });
  publishedCourseId = pubCourse._id;

  const l1 = await Lesson.create({
    title: 'Component Design Tokens',
    description: 'CSS variables and tokens',
    videoUrl: 'https://youtube.com/watch?v=111',
    duration: 300,
    order: 1,
    isPreview: true,
    status: COURSE_STATUS.PUBLISHED,
    courseId: publishedCourseId,
    createdBy: adminId,
  });
  lesson1Id = l1._id;

  const l2 = await Lesson.create({
    title: 'Atomic Component Architecture',
    description: 'Building button, card, modal',
    videoUrl: 'https://youtube.com/watch?v=222',
    duration: 600,
    order: 2,
    isPreview: false,
    status: COURSE_STATUS.PUBLISHED,
    courseId: publishedCourseId,
    createdBy: adminId,
  });
  lesson2Id = l2._id;

  // Active Enrollment for primary student
  await Enrollment.create({
    studentId,
    courseId: publishedCourseId,
    status: 'active',
  });
});

describe('Progress Module API Endpoints', () => {
  describe('POST /api/lessons/:lessonId/start', () => {
    it('should allow enrolled Student to start a lesson', async () => {
      const res = await request(app)
        .post(`/api/lessons/${lesson1Id}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.progress.status).toBe('in_progress');
    });

    it('should block non-enrolled students from starting a lesson', async () => {
      const res = await request(app)
        .post(`/api/lessons/${lesson1Id}/start`)
        .set('Authorization', `Bearer ${secondStudentToken}`)
        .send();

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/lessons/:lessonId/progress', () => {
    it('should update watch time and progress percentage', async () => {
      const res = await request(app)
        .patch(`/api/lessons/${lesson1Id}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ watchTimeSeconds: 150, progressPercent: 50 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.progress.progressPercent).toBe(50);
      expect(res.body.data.progress.watchTimeSeconds).toBe(150);
      expect(res.body.data.progress.status).toBe('in_progress');
    });

    it('should auto-complete lesson when progress percentage reaches 100%', async () => {
      const res = await request(app)
        .patch(`/api/lessons/${lesson1Id}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ watchTimeSeconds: 300, progressPercent: 100 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.progress.progressPercent).toBe(100);
      expect(res.body.data.progress.status).toBe('completed');
    });
  });

  describe('POST /api/lessons/:lessonId/complete', () => {
    it('should mark a lesson as completed idempotently', async () => {
      // First completion
      const res1 = await request(app)
        .post(`/api/lessons/${lesson1Id}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res1.statusCode).toBe(200);
      expect(res1.body.data.progress.status).toBe('completed');

      // Second completion (duplicate call)
      const res2 = await request(app)
        .post(`/api/lessons/${lesson1Id}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data.progress.status).toBe('completed');
    });
  });

  describe('GET /api/courses/:courseId/progress', () => {
    it('should compute course completion metrics correctly', async () => {
      // Complete lesson 1 of 2
      await request(app)
        .post(`/api/lessons/${lesson1Id}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      const res = await request(app)
        .get(`/api/courses/${publishedCourseId}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalLessons).toBe(2);
      expect(res.body.data.completedLessons).toBe(1);
      expect(res.body.data.completionPercentage).toBe(50);
      expect(res.body.data.nextLesson._id).toBe(lesson2Id.toString());
    });
  });
});

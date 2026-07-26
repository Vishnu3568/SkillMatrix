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
let adminToken;
let studentToken;
let adminId;
let studentId;
let publishedCourseId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const passwordHash = await hashPassword('Password123!');

  const admin = await User.create({
    fullName: 'Platform Admin',
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
    fullName: 'Sample Student',
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
  await Progress.deleteMany({});

  const pubCourse = await Course.create({
    title: 'Fullstack MERN Architecture',
    shortDescription: 'Enterprise MERN engineering.',
    description: 'Detailed description.',
    category: 'Web Development',
    level: COURSE_LEVELS.INTERMEDIATE,
    estimatedDuration: 240,
    status: COURSE_STATUS.PUBLISHED,
    createdBy: adminId,
  });
  publishedCourseId = pubCourse._id;

  const lesson = await Lesson.create({
    title: 'Architecture Overview',
    description: 'System design overview',
    videoUrl: 'https://youtube.com/watch?v=111',
    duration: 400,
    order: 1,
    isPreview: true,
    status: COURSE_STATUS.PUBLISHED,
    courseId: publishedCourseId,
    createdBy: adminId,
  });

  await Enrollment.create({
    studentId,
    courseId: publishedCourseId,
    status: 'active',
  });

  await Progress.create({
    studentId,
    courseId: publishedCourseId,
    lessonId: lesson._id,
    status: 'completed',
    progressPercent: 100,
    watchTimeSeconds: 400,
  });
});

describe('Admin Dashboard Analytics API', () => {
  describe('GET /api/admin/dashboard', () => {
    it('should return complete analytics dashboard payload for Admin users', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const { summary, topCourses, newestStudents, recentEnrollments, activityFeed } = res.body.data;

      // Summary assertions
      expect(summary.totalUsers).toBeGreaterThanOrEqual(2);
      expect(summary.totalStudents).toBeGreaterThanOrEqual(1);
      expect(summary.totalAdmins).toBeGreaterThanOrEqual(1);
      expect(summary.totalCourses).toBe(1);
      expect(summary.publishedCourses).toBe(1);
      expect(summary.totalLessons).toBe(1);
      expect(summary.totalEnrollments).toBe(1);
      expect(summary.completedLessons).toBe(1);

      // Data collections assertions
      expect(Array.isArray(topCourses)).toBe(true);
      expect(topCourses.length).toBeGreaterThanOrEqual(1);
      expect(topCourses[0].title).toBe('Fullstack MERN Architecture');

      expect(Array.isArray(newestStudents)).toBe(true);
      expect(newestStudents.length).toBeGreaterThanOrEqual(1);

      expect(Array.isArray(recentEnrollments)).toBe(true);
      expect(recentEnrollments.length).toBeGreaterThanOrEqual(1);

      expect(Array.isArray(activityFeed)).toBe(true);
      expect(activityFeed.length).toBeGreaterThanOrEqual(1);
    });

    it('should block Student users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(403);
    });

    it('should block Guest users with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .send();

      expect(res.statusCode).toBe(401);
    });
  });
});

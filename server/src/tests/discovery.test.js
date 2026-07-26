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
let studentId;
let studentToken;
let course1Id;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const passwordHash = await hashPassword('Password123!');

  const admin = await User.create({
    fullName: 'Discovery Admin',
    email: 'discadmin@example.com',
    passwordHash,
    role: ROLES.ADMIN,
    activeSessionHash: 'adminsession',
  });
  adminId = admin._id;

  const student = await User.create({
    fullName: 'Discovery Student',
    email: 'discstudent@example.com',
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

  const c1 = await Course.create({
    title: 'Alpha React Masterclass',
    shortDescription: 'Build enterprise React apps',
    description: 'Detailed React guide',
    category: 'Frontend',
    level: COURSE_LEVELS.INTERMEDIATE,
    estimatedDuration: 180,
    status: COURSE_STATUS.PUBLISHED,
    tags: ['react', 'javascript', 'frontend'],
    createdBy: adminId,
  });
  course1Id = c1._id;

  await Course.create({
    title: 'Zeta Node.js Microservices',
    shortDescription: 'Scalable backend API services',
    description: 'Detailed Node.js guide',
    category: 'Backend',
    level: COURSE_LEVELS.ADVANCED,
    estimatedDuration: 300,
    status: COURSE_STATUS.PUBLISHED,
    tags: ['node', 'express', 'backend'],
    createdBy: adminId,
  });

  await Course.create({
    title: 'Draft Python Fundamentals',
    shortDescription: 'Internal draft course',
    description: 'Draft course guide',
    category: 'Data Science',
    level: COURSE_LEVELS.BEGINNER,
    estimatedDuration: 90,
    status: COURSE_STATUS.DRAFT,
    tags: ['python'],
    createdBy: adminId,
  });

  const l1 = await Lesson.create({
    title: 'React Architecture Intro',
    description: 'Introduction to components',
    videoUrl: 'https://youtube.com/watch?v=111',
    duration: 300,
    order: 1,
    status: COURSE_STATUS.PUBLISHED,
    courseId: course1Id,
    createdBy: adminId,
  });

  await Enrollment.create({
    studentId,
    courseId: course1Id,
    status: 'active',
  });

  await Progress.create({
    studentId,
    courseId: course1Id,
    lessonId: l1._id,
    status: 'completed',
    progressPercent: 100,
    watchTimeSeconds: 300,
  });
});

describe('Course Search, Filtering & Discovery API', () => {
  describe('GET /api/courses (Advanced Filtering & Sorting)', () => {
    it('should search courses by text query', async () => {
      const res = await request(app).get('/api/courses?search=React').send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courses.length).toBe(1);
      expect(res.body.data.courses[0].title).toBe('Alpha React Masterclass');
    });

    it('should filter courses by category and level', async () => {
      const res = await request(app)
        .get(`/api/courses?category=Backend&level=${COURSE_LEVELS.ADVANCED}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses.length).toBe(1);
      expect(res.body.data.courses[0].title).toBe('Zeta Node.js Microservices');
    });

    it('should sort courses alphabetically', async () => {
      const res = await request(app).get('/api/courses?sort=alphabetical').send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses[0].title).toBe('Alpha React Masterclass');
      expect(res.body.data.courses[1].title).toBe('Zeta Node.js Microservices');
    });

    it('should sort courses by most enrolled', async () => {
      const res = await request(app).get('/api/courses?sort=most_enrolled').send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses[0]._id).toBe(course1Id.toString());
    });
  });

  describe('GET /api/courses/popular', () => {
    it('should return top enrolled popular published courses', async () => {
      const res = await request(app).get('/api/courses/popular?limit=2').send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courses.length).toBe(2);
      expect(res.body.data.courses[0]._id).toBe(course1Id.toString());
    });
  });

  describe('GET /api/courses/recommended', () => {
    it('should return personalized recommended courses for authenticated student', async () => {
      const res = await request(app)
        .get('/api/courses/recommended')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.courses)).toBe(true);
    });
  });

  describe('GET /api/courses/recent-learning', () => {
    it('should return student recent learning activities when authenticated', async () => {
      const res = await request(app)
        .get('/api/courses/recent-learning')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.recentlyCompleted)).toBe(true);
      expect(res.body.data.recentlyCompleted.length).toBe(1);
    });

    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/courses/recent-learning').send();
      expect(res.statusCode).toBe(401);
    });
  });
});

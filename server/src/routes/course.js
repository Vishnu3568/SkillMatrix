const express = require('express');
const courseController = require('../controllers/course.controller');
const validate = require('../middlewares/validate');
const {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
} = require('../validators/course.validator');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

// Public / Discovery Endpoints (Must be mounted before /:slug)
router.get('/popular', optionalAuthenticate, courseController.getPopularCourses);
router.get('/recommended', optionalAuthenticate, courseController.getRecommendedCourses);
router.get('/recent-learning', authenticate, courseController.getRecentLearning);

// Course List with Filters & Pagination
router.get(
  '/',
  optionalAuthenticate,
  validate(listCoursesQuerySchema, 'query'),
  courseController.listCourses
);

// Admin Write Endpoints
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createCourseSchema),
  courseController.createCourse
);

// Single Course Detail Route by Slug or ID
router.get('/:slug', optionalAuthenticate, courseController.getCourseBySlug);

// Admin Update/Delete Endpoints
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateCourseSchema),
  courseController.updateCourse
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize(ROLES.ADMIN),
  courseController.publishCourse
);

router.patch(
  '/:id/archive',
  authenticate,
  authorize(ROLES.ADMIN),
  courseController.archiveCourse
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  courseController.deleteCourse
);

module.exports = router;

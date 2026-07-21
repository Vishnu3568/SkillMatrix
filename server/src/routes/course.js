const express = require('express');
const courseController = require('../controllers/course.controller');
const validate = require('../middlewares/validate');
const { createCourseSchema, updateCourseSchema } = require('../validators/course.validator');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router();

// Admin write endpoints
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createCourseSchema),
  courseController.createCourse
);

// Conditional read endpoints (Admin gets draft/archived; Student gets only published)
router.get('/', optionalAuthenticate, courseController.listCourses);
router.get('/:slug', optionalAuthenticate, courseController.getCourseBySlug);

// Admin update/delete endpoints
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

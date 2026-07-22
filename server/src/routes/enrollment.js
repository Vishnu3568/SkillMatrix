const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const validate = require('../middlewares/validate');
const { courseIdParamSchema } = require('../validators/enrollment.validator');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

// Router for /api/courses/:courseId/enroll
const courseEnrollmentRouter = express.Router({ mergeParams: true });

courseEnrollmentRouter.post(
  '/',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(courseIdParamSchema, 'params'),
  enrollmentController.enrollStudent
);

// Router for /api/enrollments
const enrollmentRouter = express.Router();

enrollmentRouter.get(
  '/:courseId/status',
  optionalAuthenticate,
  validate(courseIdParamSchema, 'params'),
  enrollmentController.checkEnrollmentStatus
);

enrollmentRouter.delete(
  '/:courseId',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(courseIdParamSchema, 'params'),
  enrollmentController.cancelEnrollment
);

// Router for /api/my-learning
const myLearningRouter = express.Router();

myLearningRouter.get(
  '/',
  authenticate,
  authorize(ROLES.STUDENT),
  enrollmentController.listStudentEnrollments
);

// Router for /api/admin/enrollments
const adminEnrollmentRouter = express.Router();

adminEnrollmentRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  enrollmentController.adminListEnrollments
);

module.exports = {
  courseEnrollmentRouter,
  enrollmentRouter,
  myLearningRouter,
  adminEnrollmentRouter,
};

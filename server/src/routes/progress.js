const express = require('express');
const progressController = require('../controllers/progress.controller');
const validate = require('../middlewares/validate');
const {
  lessonIdParamSchema,
  courseIdParamSchema,
  updateProgressSchema,
} = require('../validators/progress.validator');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

// Router mounted at /api/lessons/:lessonId
const lessonProgressRouter = express.Router({ mergeParams: true });

lessonProgressRouter.post(
  '/start',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(lessonIdParamSchema, 'params'),
  progressController.startLesson
);

lessonProgressRouter.patch(
  '/progress',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(lessonIdParamSchema, 'params'),
  validate(updateProgressSchema, 'body'),
  progressController.updateProgress
);

lessonProgressRouter.post(
  '/complete',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(lessonIdParamSchema, 'params'),
  progressController.completeLesson
);

lessonProgressRouter.get(
  '/progress',
  optionalAuthenticate,
  validate(lessonIdParamSchema, 'params'),
  progressController.getLessonProgress
);

// Router mounted at /api/courses/:courseId
const courseProgressRouter = express.Router({ mergeParams: true });

courseProgressRouter.get(
  '/progress',
  optionalAuthenticate,
  validate(courseIdParamSchema, 'params'),
  progressController.getCourseProgress
);

courseProgressRouter.get(
  '/continue',
  optionalAuthenticate,
  validate(courseIdParamSchema, 'params'),
  progressController.getContinueLearning
);

module.exports = {
  lessonProgressRouter,
  courseProgressRouter,
};

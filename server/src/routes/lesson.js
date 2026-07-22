const express = require('express');
const lessonController = require('../controllers/lesson.controller');
const validate = require('../middlewares/validate');
const { createLessonSchema, updateLessonSchema, reorderLessonsSchema } = require('../validators/lesson.validator');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants');

const router = express.Router({ mergeParams: true });

// Course scoped subroutes (mounts under /api/courses/:courseId/lessons)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createLessonSchema),
  lessonController.createLesson
);

router.get('/', optionalAuthenticate, lessonController.listLessons);

router.patch(
  '/reorder',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(reorderLessonsSchema),
  lessonController.reorderLessons
);

// Lesson specific singleton routes (mounts under /api/lessons)
const lessonRouter = express.Router();

lessonRouter.get('/:slug', optionalAuthenticate, lessonController.getLessonBySlug);

lessonRouter.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateLessonSchema),
  lessonController.updateLesson
);

lessonRouter.patch(
  '/:id/publish',
  authenticate,
  authorize(ROLES.ADMIN),
  lessonController.publishLesson
);

lessonRouter.patch(
  '/:id/archive',
  authenticate,
  authorize(ROLES.ADMIN),
  lessonController.archiveLesson
);

lessonRouter.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  lessonController.deleteLesson
);

module.exports = {
  courseLessonRouter: router,
  lessonRouter,
};

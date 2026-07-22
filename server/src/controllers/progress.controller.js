const progressService = require('../services/progress.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

const startLesson = async (req, res, next) => {
  try {
    const progress = await progressService.startLesson(req.user.id, req.params.lessonId);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson started successfully',
      { progress }
    );
  } catch (error) {
    next(error);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const progress = await progressService.updateProgress(
      req.user.id,
      req.params.lessonId,
      req.body
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson progress updated successfully',
      { progress }
    );
  } catch (error) {
    next(error);
  }
};

const completeLesson = async (req, res, next) => {
  try {
    const progress = await progressService.completeLesson(req.user.id, req.params.lessonId);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson marked as complete',
      { progress }
    );
  } catch (error) {
    next(error);
  }
};

const getLessonProgress = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const progress = await progressService.getLessonProgress(userId, req.params.lessonId);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson progress fetched successfully',
      { progress }
    );
  } catch (error) {
    next(error);
  }
};

const getCourseProgress = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await progressService.getCourseProgress(userId, req.params.courseId);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Course progress metrics calculated successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

const getContinueLearning = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const nextLesson = await progressService.getContinueLearningLesson(userId, req.params.courseId);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Continue learning target lesson fetched successfully',
      { lesson: nextLesson }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startLesson,
  updateProgress,
  completeLesson,
  getLessonProgress,
  getCourseProgress,
  getContinueLearning,
};

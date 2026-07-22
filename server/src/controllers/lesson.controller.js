const lessonService = require('../services/lesson.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

const createLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.createLesson(req.params.courseId, req.body, req.user.id);
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      'Lesson created successfully',
      { lesson }
    );
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.updateLesson(req.params.id, req.body);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson updated successfully',
      { lesson }
    );
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    await lessonService.deleteLesson(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

const publishLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.publishLesson(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson published successfully',
      { lesson }
    );
  } catch (error) {
    next(error);
  }
};

const archiveLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.archiveLesson(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson archived successfully',
      { lesson }
    );
  } catch (error) {
    next(error);
  }
};

const getLessonBySlug = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const lesson = await lessonService.getLessonBySlug(req.params.slug, userId, userRole);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lesson details fetched successfully',
      { lesson }
    );
  } catch (error) {
    next(error);
  }
};

const listLessons = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const lessons = await lessonService.listLessons(req.params.courseId, req.query, userRole);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lessons fetched successfully',
      { lessons }
    );
  } catch (error) {
    next(error);
  }
};

const reorderLessons = async (req, res, next) => {
  try {
    const lessons = await lessonService.reorderLessons(req.params.courseId, req.body.orderedIds);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Lessons reordered successfully',
      { lessons }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLesson,
  updateLesson,
  deleteLesson,
  publishLesson,
  archiveLesson,
  getLessonBySlug,
  listLessons,
  reorderLessons,
};

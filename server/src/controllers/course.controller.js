const courseService = require('../services/course.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user.id);
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      'Course created successfully',
      { course }
    );
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Course updated successfully',
      { course }
    );
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Course deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

const publishCourse = async (req, res, next) => {
  try {
    const course = await courseService.publishCourse(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Course published successfully',
      { course }
    );
  } catch (error) {
    next(error);
  }
};

const archiveCourse = async (req, res, next) => {
  try {
    const course = await courseService.archiveCourse(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Course archived successfully',
      { course }
    );
  } catch (error) {
    next(error);
  }
};

const getCourseBySlug = async (req, res, next) => {
  try {
    const userRole = req.user?.role; // Set by optionalAuthenticate
    const course = await courseService.getCourseBySlug(req.params.slug, userRole);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Course details fetched successfully',
      { course }
    );
  } catch (error) {
    next(error);
  }
};

const listCourses = async (req, res, next) => {
  try {
    const userRole = req.user?.role; // Set by optionalAuthenticate or authenticate
    const result = await courseService.listCourses(req.query, userRole);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Courses list fetched successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
  getCourseBySlug,
  listCourses,
};

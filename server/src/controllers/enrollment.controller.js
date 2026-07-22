const enrollmentService = require('../services/enrollment.service');
const { successResponse } = require('../responses');
const { HTTP_STATUS } = require('../constants');

const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.enrollStudent(
      req.user.id,
      req.params.courseId
    );
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      'Enrolled in course successfully',
      { enrollment }
    );
  } catch (error) {
    next(error);
  }
};

const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await enrollmentService.checkEnrollmentStatus(
      userId,
      req.params.courseId
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Enrollment status checked successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

const listStudentEnrollments = async (req, res, next) => {
  try {
    const result = await enrollmentService.listStudentEnrollments(
      req.user.id,
      req.query
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Enrolled courses fetched successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

const cancelEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.cancelEnrollment(
      req.user.id,
      req.params.courseId
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Enrollment cancelled successfully',
      { enrollment }
    );
  } catch (error) {
    next(error);
  }
};

const adminListEnrollments = async (req, res, next) => {
  try {
    const result = await enrollmentService.adminListEnrollments(req.query);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Admin enrollments list fetched successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollStudent,
  checkEnrollmentStatus,
  listStudentEnrollments,
  cancelEnrollment,
  adminListEnrollments,
};

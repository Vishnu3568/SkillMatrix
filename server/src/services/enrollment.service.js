const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { COURSE_STATUS, ENROLLMENT_STATUS } = require('../constants');
const { NotFoundError, ValidationError, ConflictError } = require('../errors');

/**
 * Enrolls a student into a published course.
 */
const enrollStudent = async (studentId, courseId) => {
  // 1. Verify course existence and status
  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  if (course.status !== COURSE_STATUS.PUBLISHED) {
    throw new ValidationError('Cannot enroll in a course that is not published');
  }

  // 2. Check for existing enrollment
  let enrollment = await Enrollment.findOne({ studentId, courseId });

  if (enrollment) {
    if (!enrollment.isDeleted && enrollment.status === ENROLLMENT_STATUS.ACTIVE) {
      throw new ConflictError('You are already enrolled in this course');
    }
    
    // Reactivate existing cancelled or soft-deleted enrollment
    enrollment.status = ENROLLMENT_STATUS.ACTIVE;
    enrollment.enrolledAt = new Date();
    enrollment.lastAccessedAt = new Date();
    enrollment.isDeleted = false;
    enrollment.deletedAt = undefined;
    await enrollment.save();
  } else {
    // 3. Create new enrollment
    enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: ENROLLMENT_STATUS.ACTIVE,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    });
  }

  await enrollment.populate('courseId', 'title slug shortDescription category level estimatedDuration thumbnailUrl');
  return enrollment;
};

/**
 * Checks enrollment status for a specific student and course.
 */
const checkEnrollmentStatus = async (studentId, courseId) => {
  if (!studentId) {
    return { isEnrolled: false, enrollment: null };
  }

  const enrollment = await Enrollment.findOne({
    studentId,
    courseId,
    status: ENROLLMENT_STATUS.ACTIVE,
    isDeleted: false,
  });

  return {
    isEnrolled: !!enrollment,
    enrollment,
  };
};

/**
 * Lists all active course enrollments for a student with pagination and search.
 */
const listStudentEnrollments = async (studentId, queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.max(1, parseInt(queryParams.limit, 10) || 6);
  const skip = (page - 1) * limit;

  const filter = {
    studentId,
    status: ENROLLMENT_STATUS.ACTIVE,
    isDeleted: false,
  };

  // Optional course title/category search
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search, 'i');
    const matchingCourses = await Course.find({
      isDeleted: false,
      $or: [{ title: searchRegex }, { category: searchRegex }],
    }).select('_id');

    const matchingCourseIds = matchingCourses.map((c) => c._id);
    filter.courseId = { $in: matchingCourseIds };
  }

  const totalEnrollments = await Enrollment.countDocuments(filter);
  const totalPages = Math.ceil(totalEnrollments / limit) || 1;

  const enrollments = await Enrollment.find(filter)
    .populate('courseId', 'title slug shortDescription category level estimatedDuration thumbnailUrl status')
    .sort({ lastAccessedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Filter out any enrollments whose parent course was deleted or archived
  const activeEnrollments = enrollments.filter(
    (e) => e.courseId && !e.courseId.isDeleted && e.courseId.status === COURSE_STATUS.PUBLISHED
  );

  return {
    enrollments: activeEnrollments,
    page,
    limit,
    totalEnrollments,
    totalPages,
  };
};

/**
 * Cancels a student's active enrollment in a course.
 */
const cancelEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    studentId,
    courseId,
    status: ENROLLMENT_STATUS.ACTIVE,
    isDeleted: false,
  });

  if (!enrollment) {
    throw new NotFoundError('Active enrollment not found for this course');
  }

  enrollment.status = ENROLLMENT_STATUS.CANCELLED;
  await enrollment.save();

  return enrollment;
};

/**
 * Lists all system enrollments for Admins.
 */
const adminListEnrollments = async (queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.max(1, parseInt(queryParams.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  const totalEnrollments = await Enrollment.countDocuments(filter);
  const totalPages = Math.ceil(totalEnrollments / limit) || 1;

  const enrollments = await Enrollment.find(filter)
    .populate('studentId', 'fullName email avatarUrl')
    .populate('courseId', 'title slug category status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    enrollments,
    page,
    limit,
    totalEnrollments,
    totalPages,
  };
};

module.exports = {
  enrollStudent,
  checkEnrollmentStatus,
  listStudentEnrollments,
  cancelEnrollment,
  adminListEnrollments,
};

const Course = require('../models/Course');
const { COURSE_STATUS, ROLES } = require('../constants');
const { NotFoundError } = require('../errors');

/**
 * Creates a new Course.
 */
const createCourse = async (courseData, userId) => {
  const course = await Course.create({
    ...courseData,
    createdBy: userId,
    status: COURSE_STATUS.DRAFT, // Initial status is draft
  });
  return course;
};

/**
 * Updates an existing Course.
 */
const updateCourse = async (courseId, courseData) => {
  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // Update fields
  Object.assign(course, courseData);
  await course.save();

  return course;
};

/**
 * Soft deletes a Course.
 */
const deleteCourse = async (courseId) => {
  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  course.isDeleted = true;
  course.deletedAt = new Date();
  await course.save();

  return course;
};

/**
 * Publishes a Course.
 */
const publishCourse = async (courseId) => {
  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  course.status = COURSE_STATUS.PUBLISHED;
  await course.save();

  return course;
};

/**
 * Archives a Course.
 */
const archiveCourse = async (courseId) => {
  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  course.status = COURSE_STATUS.ARCHIVED;
  await course.save();

  return course;
};

const mongoose = require('mongoose');

/**
 * Retrieves a Course by slug or ObjectId.
 * Restricts draft/archived views for non-admin requests.
 */
const getCourseBySlug = async (slugOrId, userRole) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
  const query = isObjectId ? { _id: slugOrId, isDeleted: false } : { slug: slugOrId, isDeleted: false };
  
  // If not admin, restrict visibility to published courses only
  if (userRole !== ROLES.ADMIN) {
    query.status = COURSE_STATUS.PUBLISHED;
  }

  const course = await Course.findOne(query).populate('createdBy', 'fullName avatarUrl');
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  return course;
};

/**
 * Lists Courses with search filters, level, category, status, and pagination.
 */
const listCourses = async (queryOptions, userRole) => {
  const { 
    search, 
    category, 
    level, 
    status, 
    sort = '-createdAt', 
    page = 1, 
    limit = 10 
  } = queryOptions;

  const filter = { isDeleted: false };

  // RBAC restrictions: guests & students only see published courses
  if (userRole !== ROLES.ADMIN) {
    filter.status = COURSE_STATUS.PUBLISHED;
  } else if (status) {
    filter.status = status;
  }

  // Text search on title, tags, or shortDescription
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (category) {
    filter.category = { $regex: `^${category}$`, $options: 'i' };
  }

  if (level) {
    filter.level = level;
  }

  // Pagination offsets
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const parsedPage = Math.max(1, parseInt(page, 10));
  const skip = (parsedPage - 1) * parsedLimit;

  // Execute query
  const coursesQuery = Course.find(filter)
    .populate('createdBy', 'fullName avatarUrl')
    .sort(sort)
    .skip(skip)
    .limit(parsedLimit);

  const [courses, totalCount] = await Promise.all([
    coursesQuery,
    Course.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit);

  return {
    courses,
    totalCount,
    totalPages,
    page: parsedPage,
    limit: parsedLimit,
  };
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

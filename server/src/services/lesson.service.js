const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { COURSE_STATUS, ROLES } = require('../constants');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../errors');
const mongoose = require('mongoose');

/**
 * Creates a new Lesson.
 * Calculates next order index dynamically.
 */
const createLesson = async (courseId, lessonData, userId) => {
  // Validate course exists and is active
  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // Calculate next order value
  const activeCount = await Lesson.countDocuments({ courseId, isDeleted: false });
  const nextOrder = activeCount + 1;

  const lesson = await Lesson.create({
    ...lessonData,
    courseId,
    order: nextOrder,
    createdBy: userId,
    status: COURSE_STATUS.DRAFT,
  });

  return lesson;
};

/**
 * Updates an existing Lesson.
 */
const updateLesson = async (lessonId, lessonData) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  Object.assign(lesson, lessonData);
  await lesson.save();

  return lesson;
};

/**
 * Soft deletes a Lesson and closes the ordering gap.
 */
const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  lesson.isDeleted = true;
  lesson.deletedAt = new Date();
  await lesson.save();

  // Close order gaps
  const remainingLessons = await Lesson.find({ 
    courseId: lesson.courseId, 
    isDeleted: false 
  }).sort({ order: 1 });

  // Update order of remaining lessons sequentially
  for (let i = 0; i < remainingLessons.length; i++) {
    await Lesson.updateOne({ _id: remainingLessons[i]._id }, { $set: { order: i + 1 } });
  }

  return lesson;
};

/**
 * Publishes a Lesson.
 */
const publishLesson = async (lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  lesson.status = COURSE_STATUS.PUBLISHED;
  await lesson.save();

  return lesson;
};

/**
 * Archives a Lesson.
 */
const archiveLesson = async (lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  lesson.status = COURSE_STATUS.ARCHIVED;
  await lesson.save();

  return lesson;
};

/**
 * Retrieves a Lesson by slug or ObjectId.
 * Binds visibility checks for Admins, Students, and Guests.
 */
const getLessonBySlug = async (slugOrId, userId, userRole) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
  const query = isObjectId ? { _id: slugOrId, isDeleted: false } : { slug: slugOrId, isDeleted: false };
  const lesson = await Lesson.findOne(query)
    .populate('courseId')
    .populate('createdBy', 'fullName avatarUrl');

  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  const course = lesson.courseId;
  if (!course || course.isDeleted) {
    throw new NotFoundError('Parent course not found');
  }

  // Admin has total visibility
  if (userRole === ROLES.ADMIN) {
    return lesson;
  }

  // Course must be published for students/guests to access
  if (course.status !== COURSE_STATUS.PUBLISHED) {
    throw new NotFoundError('Parent course is not published');
  }

  // Lesson must be published
  if (lesson.status !== COURSE_STATUS.PUBLISHED) {
    throw new NotFoundError('Lesson is not published');
  }

  // Guest access checks (no auth token present)
  if (!userId) {
    if (!lesson.isPreview) {
      throw new ForbiddenError('Guests can only access preview lessons');
    }
  } else if (userRole === ROLES.STUDENT && !lesson.isPreview) {
    // Student access checks: non-preview lessons require an active enrollment
    const Enrollment = require('../models/Enrollment');
    const { ENROLLMENT_STATUS } = require('../constants');
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: course._id,
      status: ENROLLMENT_STATUS.ACTIVE,
      isDeleted: false,
    });

    if (!enrollment) {
      throw new ForbiddenError('Enrollment in this course is required to access this lesson');
    }
  }

  return lesson;
};

/**
 * Lists all active/published lessons of a course.
 */
const listLessons = async (courseId, queryOptions, userRole) => {
  const filter = { courseId, isDeleted: false };

  // Guests & Students only see published lessons
  if (userRole !== ROLES.ADMIN) {
    filter.status = COURSE_STATUS.PUBLISHED;
  } else if (queryOptions.status) {
    filter.status = queryOptions.status;
  }

  if (queryOptions.search) {
    filter.title = { $regex: queryOptions.search, $options: 'i' };
  }

  const lessons = await Lesson.find(filter)
    .populate('createdBy', 'fullName avatarUrl')
    .sort({ order: 1 });

  return lessons;
};

/**
 * Reorders lessons within a course.
 * Uses a double-swap temporary negation model to bypass unique index collisions.
 */
const reorderLessons = async (courseId, orderedIds) => {
  // Validate that all IDs exist and belong to this course
  const lessons = await Lesson.find({ 
    courseId, 
    _id: { $in: orderedIds }, 
    isDeleted: false 
  });

  if (lessons.length !== orderedIds.length) {
    throw new BadRequestError('Invalid lesson IDs provided for reordering');
  }

  // Phase 1: Set temporary negative order indices to prevent unique key clashes
  for (let i = 0; i < orderedIds.length; i++) {
    await Lesson.updateOne(
      { _id: orderedIds[i] },
      { $set: { order: -(i + 1) } }
    );
  }

  // Phase 2: Apply positive indices sequentially
  for (let i = 0; i < orderedIds.length; i++) {
    await Lesson.updateOne(
      { _id: orderedIds[i] },
      { $set: { order: i + 1 } }
    );
  }

  // Fetch and return reordered syllabus
  const sortedLessons = await Lesson.find({ courseId, isDeleted: false }).sort({ order: 1 });
  return sortedLessons;
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

const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { COURSE_STATUS, PROGRESS_STATUS, ENROLLMENT_STATUS } = require('../constants');
const { NotFoundError, ForbiddenError } = require('../errors');

/**
 * Helper: Validates student's active enrollment in course.
 */
const verifyStudentEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    studentId,
    courseId,
    status: ENROLLMENT_STATUS.ACTIVE,
    isDeleted: false,
  });

  if (!enrollment) {
    throw new ForbiddenError('Active course enrollment is required to track lesson progress');
  }

  return enrollment;
};

/**
 * Starts a lesson for an enrolled student.
 */
const startLesson = async (studentId, lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  const enrollment = await verifyStudentEnrollment(studentId, lesson.courseId);

  let progress = await Progress.findOne({ studentId, lessonId, isDeleted: false });

  if (!progress) {
    progress = await Progress.create({
      studentId,
      courseId: lesson.courseId,
      lessonId,
      status: PROGRESS_STATUS.IN_PROGRESS,
      progressPercent: 0,
      watchTimeSeconds: 0,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    });
  } else {
    if (progress.status === PROGRESS_STATUS.NOT_STARTED) {
      progress.status = PROGRESS_STATUS.IN_PROGRESS;
      if (!progress.startedAt) progress.startedAt = new Date();
    }
    progress.lastAccessedAt = new Date();
    await progress.save();
  }

  // Update enrollment last accessed timestamp
  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  return progress;
};

/**
 * Updates video watch time and completion percentage for a lesson.
 */
const updateProgress = async (studentId, lessonId, updateData = {}) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  const enrollment = await verifyStudentEnrollment(studentId, lesson.courseId);

  let progress = await Progress.findOne({ studentId, lessonId, isDeleted: false });

  if (!progress) {
    progress = new Progress({
      studentId,
      courseId: lesson.courseId,
      lessonId,
      status: PROGRESS_STATUS.IN_PROGRESS,
      startedAt: new Date(),
    });
  }

  const { watchTimeSeconds, progressPercent } = updateData;

  if (watchTimeSeconds !== undefined && watchTimeSeconds >= 0) {
    progress.watchTimeSeconds = Math.max(progress.watchTimeSeconds || 0, watchTimeSeconds);
  }

  if (progressPercent !== undefined) {
    const clampedPercent = Math.min(100, Math.max(progress.progressPercent || 0, progressPercent));
    progress.progressPercent = clampedPercent;

    if (clampedPercent === 100 && progress.status !== PROGRESS_STATUS.COMPLETED) {
      progress.status = PROGRESS_STATUS.COMPLETED;
      progress.completedAt = new Date();
    }
  }

  if (progress.status === PROGRESS_STATUS.NOT_STARTED && progress.progressPercent > 0) {
    progress.status = PROGRESS_STATUS.IN_PROGRESS;
    if (!progress.startedAt) progress.startedAt = new Date();
  }

  progress.lastAccessedAt = new Date();
  await progress.save();

  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  return progress;
};

/**
 * Marks a lesson as COMPLETED (idempotent).
 */
const completeLesson = async (studentId, lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, isDeleted: false });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  const enrollment = await verifyStudentEnrollment(studentId, lesson.courseId);

  let progress = await Progress.findOne({ studentId, lessonId, isDeleted: false });

  if (!progress) {
    progress = new Progress({
      studentId,
      courseId: lesson.courseId,
      lessonId,
      startedAt: new Date(),
    });
  }

  progress.status = PROGRESS_STATUS.COMPLETED;
  progress.progressPercent = 100;
  if (!progress.completedAt) progress.completedAt = new Date();
  progress.lastAccessedAt = new Date();
  await progress.save();

  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  return progress;
};

/**
 * Gets progress status for a single lesson.
 */
const getLessonProgress = async (studentId, lessonId) => {
  if (!studentId) {
    return {
      status: PROGRESS_STATUS.NOT_STARTED,
      progressPercent: 0,
      watchTimeSeconds: 0,
    };
  }

  const progress = await Progress.findOne({ studentId, lessonId, isDeleted: false });
  if (!progress) {
    return {
      status: PROGRESS_STATUS.NOT_STARTED,
      progressPercent: 0,
      watchTimeSeconds: 0,
    };
  }

  return progress;
};

/**
 * Calculates overall course progress metrics for a student.
 */
const getCourseProgress = async (studentId, courseId) => {
  const publishedLessons = await Lesson.find({
    courseId,
    status: COURSE_STATUS.PUBLISHED,
    isDeleted: false,
  }).sort({ order: 1 });

  const totalLessons = publishedLessons.length;

  if (!studentId) {
    return {
      totalLessons,
      completedLessons: 0,
      completionPercentage: 0,
      lastLesson: publishedLessons[0] || null,
      nextLesson: publishedLessons[0] || null,
      progressMap: {},
    };
  }

  const progressRecords = await Progress.find({
    studentId,
    courseId,
    isDeleted: false,
  });

  const progressMap = {};
  let completedLessons = 0;
  let lastAccessedRecord = null;

  progressRecords.forEach((rec) => {
    progressMap[rec.lessonId.toString()] = rec;
    if (rec.status === PROGRESS_STATUS.COMPLETED) {
      completedLessons += 1;
    }
    if (!lastAccessedRecord || new Date(rec.lastAccessedAt) > new Date(lastAccessedRecord.lastAccessedAt)) {
      lastAccessedRecord = rec;
    }
  });

  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Determine last lesson accessed
  let lastLesson = null;
  if (lastAccessedRecord) {
    lastLesson = publishedLessons.find((l) => l._id.toString() === lastAccessedRecord.lessonId.toString()) || null;
  }

  // Determine next uncompleted lesson in sequence
  const nextLesson = publishedLessons.find((l) => {
    const p = progressMap[l._id.toString()];
    return !p || p.status !== PROGRESS_STATUS.COMPLETED;
  }) || publishedLessons[0] || null;

  return {
    totalLessons,
    completedLessons,
    completionPercentage,
    lastLesson,
    nextLesson,
    progressMap,
  };
};

/**
 * Determines the target lesson for "Continue Learning".
 */
const getContinueLearningLesson = async (studentId, courseId) => {
  const courseProgress = await getCourseProgress(studentId, courseId);
  return courseProgress.nextLesson || courseProgress.lastLesson;
};

module.exports = {
  startLesson,
  updateProgress,
  completeLesson,
  getLessonProgress,
  getCourseProgress,
  getContinueLearningLesson,
};

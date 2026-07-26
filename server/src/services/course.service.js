const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const { COURSE_STATUS, ROLES, ENROLLMENT_STATUS, PROGRESS_STATUS } = require('../constants');
const { NotFoundError } = require('../errors');

/**
 * Creates a new Course.
 */
const createCourse = async (courseData, userId) => {
  const course = await Course.create({
    ...courseData,
    createdBy: userId,
    status: COURSE_STATUS.DRAFT,
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

/**
 * Retrieves a Course by slug or ObjectId.
 * Restricts draft/archived views for non-admin requests.
 */
const getCourseBySlug = async (slugOrId, userRole) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
  const query = isObjectId ? { _id: slugOrId, isDeleted: false } : { slug: slugOrId, isDeleted: false };
  
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
 * Lists Courses with multi-criteria search filters, tags, createdBy, sorting, and pagination.
 */
const listCourses = async (queryOptions, userRole) => {
  const { 
    search, 
    category, 
    level, 
    status, 
    tags,
    createdBy,
    publishedOnly,
    sort = 'newest', 
    page = 1, 
    limit = 10 
  } = queryOptions;

  const filter = { isDeleted: false };

  // RBAC & status filters
  if (userRole !== ROLES.ADMIN || publishedOnly === 'true' || publishedOnly === true) {
    filter.status = COURSE_STATUS.PUBLISHED;
  } else if (status) {
    filter.status = status;
  }

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (category) {
    filter.category = { $regex: `^${category}$`, $options: 'i' };
  }

  if (level) {
    filter.level = level;
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    filter.tags = { $in: tagArray.map((t) => new RegExp(t, 'i')) };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Parse sorting option
  let sortConfig = { createdAt: -1 };
  if (sort === 'newest') sortConfig = { createdAt: -1 };
  else if (sort === 'oldest') sortConfig = { createdAt: 1 };
  else if (sort === 'alphabetical') sortConfig = { title: 1 };
  else if (sort === 'alphabetical_desc') sortConfig = { title: -1 };
  else if (typeof sort === 'string' && sort.length > 0 && sort !== 'most_enrolled' && sort !== 'highest_completion') {
    sortConfig = sort;
  }

  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const parsedPage = Math.max(1, parseInt(page, 10));
  const skip = (parsedPage - 1) * parsedLimit;

  // Handle special aggregations for 'most_enrolled' or 'highest_completion'
  if (sort === 'most_enrolled' || sort === 'highest_completion') {
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollmentsList',
        },
      },
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'progressList',
        },
      },
      {
        $addFields: {
          enrollmentCount: { $size: '$enrollmentsList' },
          avgCompletion: {
            $cond: [
              { $gt: [{ $size: '$progressList' }, 0] },
              { $avg: '$progressList.progressPercent' },
              0,
            ],
          },
        },
      },
      {
        $sort: sort === 'most_enrolled' ? { enrollmentCount: -1, createdAt: -1 } : { avgCompletion: -1, createdAt: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: parsedLimit },
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
              },
            },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                'createdBy.passwordHash': 0,
                'createdBy.activeSessionHash': 0,
                'createdBy.refreshTokenVersion': 0,
                enrollmentsList: 0,
                progressList: 0,
              },
            },
          ],
        },
      },
    ];

    const result = await Course.aggregate(pipeline);
    const totalCount = result[0]?.metadata[0]?.total || 0;
    const courses = result[0]?.data || [];
    const totalPages = Math.ceil(totalCount / parsedLimit);

    return {
      courses,
      totalCount,
      totalPages,
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  // Standard MongoDB query
  const coursesQuery = Course.find(filter)
    .populate('createdBy', 'fullName avatarUrl')
    .sort(sortConfig)
    .skip(skip)
    .limit(parsedLimit)
    .lean();

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

/**
 * Retrieves Top Enrolled Popular Published Courses.
 */
const getPopularCourses = async (limit = 6) => {
  const parsedLimit = Math.max(1, Math.min(20, parseInt(limit, 10)));

  const aggregated = await Enrollment.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$courseId', enrollmentCount: { $sum: 1 } } },
    { $sort: { enrollmentCount: -1 } },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $match: {
        'course.status': COURSE_STATUS.PUBLISHED,
        'course.isDeleted': false,
      },
    },
    {
      $lookup: {
        from: 'progresses',
        localField: '_id',
        foreignField: 'courseId',
        as: 'progressList',
      },
    },
    {
      $project: {
        _id: '$course._id',
        title: '$course.title',
        slug: '$course.slug',
        shortDescription: '$course.shortDescription',
        thumbnailUrl: '$course.thumbnailUrl',
        category: '$course.category',
        level: '$course.level',
        estimatedDuration: '$course.estimatedDuration',
        enrollmentCount: 1,
        completionPercentage: {
          $cond: [
            { $gt: [{ $size: '$progressList' }, 0] },
            { $round: [{ $avg: '$progressList.progressPercent' }, 0] },
            0,
          ],
        },
      },
    },
    { $limit: parsedLimit },
  ]);

  // If fewer than limit, backfill with published courses
  if (aggregated.length < parsedLimit) {
    const existingIds = aggregated.map((c) => c._id);
    const fillCount = parsedLimit - aggregated.length;

    const fillCourses = await Course.find({
      _id: { $nin: existingIds },
      status: COURSE_STATUS.PUBLISHED,
      isDeleted: false,
    })
      .select('title slug shortDescription thumbnailUrl category level estimatedDuration')
      .sort({ createdAt: -1 })
      .limit(fillCount)
      .lean();

    const formattedFill = fillCourses.map((c) => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      thumbnailUrl: c.thumbnailUrl,
      category: c.category,
      level: c.level,
      estimatedDuration: c.estimatedDuration,
      enrollmentCount: 0,
      completionPercentage: 0,
    }));

    return [...aggregated, ...formattedFill];
  }

  return aggregated;
};

/**
 * Retrieves Personalized Recommended Courses for a user or guests.
 */
const getRecommendedCourses = async (userId = null, limit = 6) => {
  const parsedLimit = Math.max(1, Math.min(20, parseInt(limit, 10)));

  if (!userId) {
    return getPopularCourses(parsedLimit);
  }

  // Find user's active enrollments
  const userEnrollments = await Enrollment.find({
    studentId: userId,
    isDeleted: false,
  }).populate('courseId', 'category');

  const enrolledCourseIds = userEnrollments.map((e) => e.courseId?._id?.toString()).filter(Boolean);
  const enrolledCategories = [...new Set(userEnrollments.map((e) => e.courseId?.category).filter(Boolean))];

  let recommended = [];

  if (enrolledCategories.length > 0) {
    recommended = await Course.find({
      _id: { $nin: enrolledCourseIds },
      category: { $in: enrolledCategories },
      status: COURSE_STATUS.PUBLISHED,
      isDeleted: false,
    })
      .populate('createdBy', 'fullName avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();
  }

  // If recommendations fewer than limit, backfill with popular published courses not yet enrolled
  if (recommended.length < parsedLimit) {
    const existingRecIds = [...enrolledCourseIds, ...recommended.map((r) => r._id.toString())];
    const popularFallback = await getPopularCourses(parsedLimit * 2);
    const filteredFallback = popularFallback.filter((p) => !existingRecIds.includes(p._id.toString()));

    const needed = parsedLimit - recommended.length;
    recommended = [...recommended, ...filteredFallback.slice(0, needed)];
  }

  return recommended;
};

/**
 * Retrieves Student's Recent Learning activity (Continue Learning target, Recently Viewed, Recently Completed).
 */
const getRecentLearning = async (userId) => {
  const enrollments = await Enrollment.find({
    studentId: userId,
    status: ENROLLMENT_STATUS.ACTIVE,
    isDeleted: false,
  })
    .populate('courseId')
    .sort({ lastAccessedAt: -1, updatedAt: -1 })
    .lean();

  const activeEnrollments = enrollments.filter((e) => e.courseId && !e.courseId.isDeleted && e.courseId.status === COURSE_STATUS.PUBLISHED);

  if (activeEnrollments.length === 0) {
    return {
      continueLearning: null,
      recentlyViewed: [],
      recentlyCompleted: [],
    };
  }

  // Get progress records for active courses
  const courseIds = activeEnrollments.map((e) => e.courseId._id);
  const progressRecords = await Progress.find({
    studentId: userId,
    courseId: { $in: courseIds },
    isDeleted: false,
  }).lean();

  const progressMapByCourse = {};
  progressRecords.forEach((p) => {
    const cId = p.courseId.toString();
    if (!progressMapByCourse[cId]) progressMapByCourse[cId] = [];
    progressMapByCourse[cId].push(p);
  });

  const recentlyViewed = [];
  const recentlyCompleted = [];
  let continueLearning = null;

  for (const item of activeEnrollments) {
    const course = item.courseId;
    const pLogs = progressMapByCourse[course._id.toString()] || [];

    const totalLessons = await Lesson.countDocuments({
      courseId: course._id,
      status: COURSE_STATUS.PUBLISHED,
      isDeleted: false,
    });

    const completedLessons = pLogs.filter((p) => p.status === PROGRESS_STATUS.COMPLETED).length;
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const courseItem = {
      ...course,
      completionPercentage,
      completedLessons,
      totalLessons,
      lastAccessedAt: item.lastAccessedAt || item.updatedAt,
    };

    if (completionPercentage === 100) {
      recentlyCompleted.push(courseItem);
    } else {
      recentlyViewed.push(courseItem);

      if (!continueLearning) {
        // Find next uncompleted lesson in course
        const lessons = await Lesson.find({
          courseId: course._id,
          status: COURSE_STATUS.PUBLISHED,
          isDeleted: false,
        }).sort({ order: 1 }).lean();

        const completedSet = new Set(pLogs.filter((p) => p.status === PROGRESS_STATUS.COMPLETED).map((p) => p.lessonId.toString()));
        const nextLesson = lessons.find((l) => !completedSet.has(l._id.toString())) || lessons[0];

        continueLearning = {
          course,
          nextLesson,
          completionPercentage,
          completedLessons,
          totalLessons,
        };
      }
    }
  }

  return {
    continueLearning,
    recentlyViewed,
    recentlyCompleted,
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
  getPopularCourses,
  getRecommendedCourses,
  getRecentLearning,
};
